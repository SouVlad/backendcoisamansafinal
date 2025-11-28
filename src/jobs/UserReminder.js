import prisma from "../prisma.js";
import cron from "node-cron";
import dotenv from "dotenv";
import { sendEmailReminder, verifyEmailTransport, initializeEmailTransport } from "../services/email.service.js";
import { SCHEDULE_OFFSET_DAYS, WINDOW_MINUTES } from "../config/constants.js";

dotenv.config();

console.log("DEBUG: carregadas env vars:",
  "MAIL_USER?", !!process.env.MAIL_USER,
  "MAIL_PASS?", !!process.env.MAIL_PASS,
  "DATABASE_URL?", !!process.env.DATABASE_URL,
  "NODE_ENV:", process.env.NODE_ENV || "undefined"
);

function datePlusDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function minutesBefore(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - mins);
  return d;
}

function minutesAfter(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}

async function markReminderSent(concertId) {
  await prisma.concert.update({
    where: { id: concertId },
    data: { reminderSent: true },
  });
}

async function fetchConcertsToNotify() {
  const now = new Date();
  const target = datePlusDays(now, SCHEDULE_OFFSET_DAYS);
  const from = minutesBefore(target, WINDOW_MINUTES);
  const to = minutesAfter(target, WINDOW_MINUTES);

  console.log("DEBUG: fetchConcertsToNotify interval:", from.toISOString(), "->", to.toISOString());

  const concerts = await prisma.concert.findMany({
    where: {
      reminderSent: false,
      date: {
        gte: from,
        lte: to,
      },
    },
  });
  return concerts;
}

async function workerIteration() {
  try {
    console.log("DEBUG: workerIteration started — searching for concerts...");
    const concerts = await fetchConcertsToNotify();
    console.log("DEBUG: concerts found:", concerts.length);
    
    if (!concerts.length) {
      console.log("No concerts to notify now.");
      return;
    }

    const users = await prisma.user.findMany();
    console.log("DEBUG: users found:", users.length);
    
    if (!users.length) {
      console.log("No users found to send notifications.");
      return;
    }

    console.log(`Found ${concerts.length} concerts. Sending to ${users.length} users...`);

    for (const concert of concerts) {
      for (const user of users) {
        try {
          await sendEmailReminder(user, concert);
          await new Promise((r) => setTimeout(r, 300));
        } catch (err) {
          console.error(`Failed to send to ${user.email} for concert ${concert.id}. Continuing...`);
        }
      }
      await markReminderSent(concert.id);
      console.log(`Concert ${concert.id} marked as reminderSent=true`);
    }
  } catch (err) {
    console.error("Error in workerIteration:", err);
  }
}

export async function startJobs({ runImmediateInDev = true } = {}) {
  await initializeEmailTransport();

  cron.schedule("0 9 * * *", () => {
    console.log("Cron fired at 09:00 — checking concerts...");
    workerIteration().catch((err) => console.error("Error in scheduled worker:", err));
  });

  if (process.env.NODE_ENV !== "production" && runImmediateInDev) {
    try {
      console.log("Development environment: checking email transporter...");
      const verified = await verifyEmailTransport();
      
      console.log("Running workerIteration() immediately for testing.");
      await workerIteration();
    } catch (err) {
      console.error("Error running workerIteration() in dev:", err);
    }
  }

  console.log("UserReminder jobs started.");
}

export async function sendTestEmail() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user in database for testing.");
    return;
  }

  const concert = {
    title: "Test Concert",
    location: "Main Auditorium",
    date: new Date(),
  };

  try {
    const verified = await verifyEmailTransport();
    if (!verified) {
      console.error("Email transport verification failed.");
      return;
    }

    await sendEmailReminder(user, concert);
    console.log("Test email sent successfully.");
  } catch (err) {
    console.error("Error sending test email:", err);
  }
}

if (process.argv[1] && process.argv[1].includes("UserReminder")) {
  (async () => {
    try {
      await startJobs({ runImmediateInDev: false });
      await sendTestEmail();
      console.log("Direct UserReminder execution completed (test mode).");
    } catch (err) {
      console.error("Error executing UserReminder directly:", err);
      process.exit(1);
    }
  })();
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
