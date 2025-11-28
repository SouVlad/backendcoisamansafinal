import express from "express";
import authRoutes from "./auth.js";
import usersRoutes from "./usersRouter.js";
import eventsRoutes from "./events.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/api/users", usersRoutes);
router.use("/api/events", eventsRoutes);

export default router;
