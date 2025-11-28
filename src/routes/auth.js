import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/verify", authController.verify);
router.post("/logout", authController.logout);
router.get("/profile", requireAuth, authController.getProfile);
router.put("/profile", requireAuth, authController.updateProfile);

export default router;
