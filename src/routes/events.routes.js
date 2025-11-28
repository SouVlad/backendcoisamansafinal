import express from "express";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventsController.js";
import { optionalAuth, requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, listEvents);
router.get("/:id", optionalAuth, getEvent);
router.post("/", requireAuth, requireAdmin, createEvent);
router.put("/:id", requireAuth, requireAdmin, updateEvent);
router.delete("/:id", requireAuth, requireAdmin, deleteEvent);

export default router;
