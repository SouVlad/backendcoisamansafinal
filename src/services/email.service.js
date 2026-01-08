import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

let transporter = null;

export async function initializeEmailTransport() {
  if (transporter) return transporter;

  const hasOAuth = process.env.GOOGLE_CLIENT_ID && 
                   process.env.GOOGLE_CLIENT_SECRET && 
                   process.env.GOOGLE_REFRESH_TOKEN;

  if (hasOAuth) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground"
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  return transporter;
}

export async function sendEmailReminder(user, concert) {
  const transport = await initializeEmailTransport();
  
  const formattedDate = new Date(concert.date || concert.startsAt).toLocaleString("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const subject = `Lembrete: Concerto ${concert.title} em 3 dias`;

  const textBody = `Olá ${user.username},

Lembrete: o concerto "${concert.title}" será em ${formattedDate} no ${concert.location}.

Até lá,
Coisa Mansa`;

  const htmlBody = `<p>Olá <strong>${user.username}</strong>,</p>
<p>Lembrete: o concerto "<strong>${concert.title}</strong>" será em <strong>${formattedDate}</strong> no <strong>${concert.location}</strong>.</p>
<p>Até lá,<br><em>Coisa Mansa</em></p>`;

  const mailOptions = {
    from: `"Coisa Mansa" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Email enviado para ${user.email} | messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Erro ao enviar email para ${user.email}:`, err?.message || err);
    throw err;
  }
}

export async function verifyEmailTransport() {
  const transport = await initializeEmailTransport();
  try {
    await transport.verify();
    console.log("Transportador SMTP verificado com sucesso.");
    return true;
  } catch (err) {
    console.error("Falha ao verificar transportador SMTP:", err);
    return false;
  }
}

export async function sendNewEventNotification(user, event) {
  const transport = await initializeEmailTransport();
  
  const formattedDate = new Date(event.startsAt).toLocaleString("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
  });

  // Criar link do Google Calendar
  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2h depois se não houver fim
  
  // Formatar datas para Google Calendar (formato: YYYYMMDDTHHMMSSZ)
  const formatDateForCalendar = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const calendarStartDate = formatDateForCalendar(startDate);
  const calendarEndDate = formatDateForCalendar(endDate);
  
  // Criar URL do Google Calendar
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${calendarStartDate}/${calendarEndDate}&details=${encodeURIComponent(event.description || 'Evento da Coisa Mansa')}&location=${encodeURIComponent(event.location || '')}`;

  const subject = `🎵 Novo Evento: ${event.title}`;

  const textBody = `Olá ${user.username},

A Coisa Mansa criou um novo evento!

📅 ${event.title}
📍 ${event.location || "Local a confirmar"}
🕒 ${formattedDate}

${event.description ? `\n${event.description}\n` : ''}
Não percas esta oportunidade!

Adiciona ao teu Google Calendar:
${calendarUrl}

Até lá,
Coisa Mansa`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Olá ${user.username},</h2>
      <p style="font-size: 16px;">A <strong>Coisa Mansa</strong> criou um novo evento!</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">📅 ${event.title}</h3>
        <p style="margin: 5px 0;"><strong>📍 Local:</strong> ${event.location || "A confirmar"}</p>
        <p style="margin: 5px 0;"><strong>🕒 Data:</strong> ${formattedDate}</p>
        ${event.description ? `<p style="margin: 15px 0 5px 0; color: #555;">${event.description}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${calendarUrl}" target="_blank" style="display: inline-block; background: #4285f4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          📅 Adicionar ao Google Calendar
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">Não percas esta oportunidade!</p>
      <p style="margin-top: 30px;">Até lá,<br><em style="color: #2c3e50;">Coisa Mansa</em></p>
    </div>
  `;

  const mailOptions = {
    from: `"Coisa Mansa" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`✅ Email de novo evento enviado para ${user.email} | messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Erro ao enviar email para ${user.email}:`, err?.message || err);
    throw err;
  }
}
