import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas do carrinho são protegidas
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.delete('/items/:itemId', cartController.removeItemFromCart);

export default router;