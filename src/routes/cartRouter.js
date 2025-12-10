import express from "express";
import * as cartController from "../controllers/cartController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, cartController.viewCart);
router.post("/items", requireAuth, cartController.addItem);
router.put("/items/:cartItemId", requireAuth, cartController.updateItemQuantity);
router.delete("/items/:cartItemId", requireAuth, cartController.removeItem);
router.delete("/", requireAuth, cartController.emptyCart);
router.post("/checkout", requireAuth, cartController.checkout);
router.post("/cancel", requireAuth, cartController.cancelCheckout);

export default router;
