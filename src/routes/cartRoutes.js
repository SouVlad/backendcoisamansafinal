import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas do carrinho são protegidas
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.delete('/items/:itemId', cartController.removeItemFromCart);

export default router;