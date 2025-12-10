import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { startJobs } from "./jobs/UserReminder.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  res.send("Website aberto com sucesso");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server a funcionar em http://localhost:${PORT}`));

if (typeof startJobs === "function") {
  startJobs().catch((err) => console.error("Erro ao iniciar UserReminder:", err));
}
