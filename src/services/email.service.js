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
