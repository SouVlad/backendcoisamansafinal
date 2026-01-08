import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
// import { startJobs } from "./jobs/UserReminder.js"; // Sistema antigo desativado

dotenv.config();

const app = express();

// Configuração CORS para permitir requisições do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Ajuste a porta do seu frontend
  credentials: true
}));

app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  res.send("Website aberto com sucesso");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server a funcionar em http://localhost:${PORT}`));

// Sistema de notificação automática desativado
// Agora os emails são enviados instantaneamente quando um evento é criado
// if (typeof startJobs === "function") {
//   startJobs().catch((err) => console.error("Erro ao iniciar UserReminder:", err));
// }
