// src/controllers/eventsController.js
import prisma from "../prisma.js";

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
    if (!title || !startsAt) return res.status(400).json({ error: "title e startsAt são obrigatórios" });

    const starts = new Date(startsAt);
    const ends = endsAt ? new Date(endsAt) : null;
    if (ends && ends < starts) return res.status(400).json({ error: "endsAt deve ser ≥ startsAt" });

    const ev = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startsAt: starts,
        endsAt: ends,
        isPublic: isPublic ?? true,
        createdById: req.user.userId,
      },
    });
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
