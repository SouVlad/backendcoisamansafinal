import express from "express";
import * as merchandiseController from "../controllers/merchandiseController.js";
import { optionalAuth, requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, merchandiseController.list);
router.get("/:id", optionalAuth, merchandiseController.getById);
router.post("/", requireAuth, requireAdmin, merchandiseController.create);
router.put("/:id", requireAuth, requireAdmin, merchandiseController.update);
router.delete("/:id", requireAuth, requireAdmin, merchandiseController.delete_);

export default router;
