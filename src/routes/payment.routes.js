import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Criar sessão de checkout (usuário autenticado)
router.post('/checkout', requireAuth, paymentController.createCheckout);

// Callbacks do Stripe
router.get('/success', paymentController.handleSuccess);
router.get('/cancel', paymentController.handleCancel);

// Obter status de pagamento
router.get('/status/:sessionId', requireAuth, paymentController.getPaymentStatus);

// Reembolso (apenas admin)
router.post('/refund/:sessionId', requireAuth, requireAdmin, paymentController.refundOrder);

export default router;
