import express from "express";
import authRoutes from "./auth.js";
import usersRoutes from "./usersRouter.js";
import eventsRoutes from "./events.routes.js";
import merchandiseRoutes from "./merchandiseRoutes.js";
import cartRoutes from "./cartRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/api/users", usersRoutes);
router.use("/api/events", eventsRoutes);
router.use("/api/merchandise", merchandiseRoutes);
router.use("/api/cart", cartRoutes);

export default router;
