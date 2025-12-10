import express from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, userController.list);
router.get("/:id", requireAuth, userController.getById);
router.put("/:id", requireAuth, userController.update);
router.delete("/:id", requireAuth, userController.delete_);

export default router;
