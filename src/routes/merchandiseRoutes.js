import { Router } from 'express';
import * as merchandiseController from '../controllers/merchandiseController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota pública para listar todos os produtos
router.get('/', merchandiseController.getAllMerchandise);

// Rotas protegidas que exigem autenticação de ADMIN
router.post('/', requireAuth, requireAdmin, merchandiseController.createMerchandise);
router.put('/:id', requireAuth, requireAdmin, merchandiseController.updateMerchandise);
router.delete('/:id', requireAuth, requireAdmin, merchandiseController.deleteMerchandise);

export default router;