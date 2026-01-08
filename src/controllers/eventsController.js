// src/controllers/eventsController.js
import prisma from "../prisma.js";
import { sendNewEventNotification } from "../services/email.service.js";

// Função auxiliar para enviar emails em segundo plano
async function sendEmailsInBackground(event, action) {
  try {
    const users = await prisma.user.findMany();
    console.log(`📧 Evento ${action}! Enviando notificação para ${users.length} utilizadores em segundo plano...`);
    
    for (const user of users) {
      try {
        await sendNewEventNotification(user, event);
        // Pequeno delay para não sobrecarregar o servidor de email
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (emailError) {
        console.error(`❌ Erro ao enviar email para ${user.email}:`, emailError.message);
        // Continua mesmo se falhar para um utilizador
      }
    }
    
    console.log(`✅ Todas as notificações foram enviadas com sucesso!`);
  } catch (emailError) {
    console.error('❌ Erro geral ao enviar notificações:', emailError);
  }
}

export async function listEvents(req, res) {
  try {
    const isAdmin = req.user?.role === "ADMIN" || req.user?.superAdmin === true;
    const where = isAdmin ? {} : { isPublic: true };

    const events = await prisma.event.findMany({
      where,
      orderBy: { startsAt: "asc" },
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar eventos." });
  }
}

export async function getEvent(req, res) {
  try {
    const id = Number(req.params.id);
    const ev = await prisma.event.findUnique({ where: { id } });
    if (!ev) return res.status(404).json({ error: "Evento não encontrado" });

    const isAdmin = req.user?.role === "ADMIN" || req.user?.superAdmin === true;
    if (!ev.isPublic && !isAdmin) return res.status(403).json({ error: "Acesso negado" });

    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter evento." });
  }
}

export async function createEvent(req, res) {
  try {
    const { title, description, location, startsAt, endsAt, isPublic } = req.body;
    
    // Validação básica
    if (!title || !startsAt) {
      return res.status(400).json({ error: "title e startsAt são obrigatórios" });
    }

    // Validar e converter datas
    const starts = new Date(startsAt);
    if (isNaN(starts.getTime())) {
      return res.status(400).json({ 
        error: "startsAt inválido. Use formato ISO 8601 (ex: 2026-02-15T20:00:00Z)" 
      });
    }

    let ends = null;
    if (endsAt) {
      ends = new Date(endsAt);
      if (isNaN(ends.getTime())) {
        return res.status(400).json({ 
          error: "endsAt inválido. Use formato ISO 8601 (ex: 2026-02-15T22:00:00Z)" 
        });
      }
      if (ends < starts) {
        return res.status(400).json({ error: "endsAt deve ser ≥ startsAt" });
      }
    }

    const eventIsPublic = isPublic ?? true;

    console.log(`🔍 DEBUG - isPublic recebido:`, isPublic, `| Tipo:`, typeof isPublic);
    console.log(`🔍 DEBUG - eventIsPublic final:`, eventIsPublic, `| Tipo:`, typeof eventIsPublic);

    const ev = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startsAt: starts,
        endsAt: ends,
        isPublic: eventIsPublic,
        createdById: req.user.userId,
      },
    });

    console.log(`🔍 DEBUG - Evento criado com isPublic:`, ev.isPublic, `| Tipo:`, typeof ev.isPublic);

    // 📧 Enviar notificação APENAS se o evento for criado como público
    // Executar em segundo plano (não bloquear a resposta)
    if (eventIsPublic === true) {
      console.log(`🔍 DEBUG - Entrando no bloco de envio de emails (eventIsPublic === true)`);
      
      // Enviar emails em segundo plano (não usar await aqui)
      sendEmailsInBackground(ev, 'criado').catch(err => {
        console.error('Erro ao enviar emails em segundo plano:', err);
      });
      
      console.log(`✅ Evento criado! Emails serão enviados em segundo plano.`);
    } else {
      console.log(`🔍 DEBUG - NÃO entrando no bloco de emails (eventIsPublic !== true)`);
      console.log(`ℹ️ Evento privado criado. Nenhuma notificação enviada.`);
    }

    // Responder imediatamente sem esperar pelos emails
    res.status(201).json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar evento." });
  }
}

export async function updateEvent(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, description, location, startsAt, endsAt, isPublic } = req.body;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    const newStartsAt = startsAt ? new Date(startsAt) : existingEvent.startsAt;
    const newEndsAt = endsAt ? new Date(endsAt) : existingEvent.endsAt;

    if (newEndsAt && newStartsAt && newEndsAt < newStartsAt) {
      return res.status(400).json({ error: "endsAt deve ser ≥ startsAt" });
    }

    const data = {
      title,
      description,
      location,
      isPublic,
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    };

    const ev = await prisma.event.update({ where: { id }, data });

    // 📧 Enviar notificação se o evento mudou de PRIVADO para PÚBLICO
    const wasPrivate = existingEvent.isPublic === false;
    const nowPublic = ev.isPublic === true;
    
    if (wasPrivate && nowPublic) {
      // Enviar emails em segundo plano (não bloquear a resposta)
      sendEmailsInBackground(ev, 'tornado público').catch(err => {
        console.error('Erro ao enviar emails em segundo plano:', err);
      });
      
      console.log(`✅ Evento atualizado para público! Emails serão enviados em segundo plano.`);
    }

    // Responder imediatamente sem esperar pelos emails
    res.json(ev);
  } catch (err) {
    console.error(err);
    if (err?.code === "P2025") return res.status(404).json({ error: "Evento não encontrado" });
    res.status(500).json({ error: "Erro ao atualizar evento." });
  }
}

export async function deleteEvent(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.event.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    if (err?.code === "P2025") return res.status(404).json({ error: "Evento não encontrado" });
    res.status(500).json({ error: "Erro ao apagar evento." });
  }
}
