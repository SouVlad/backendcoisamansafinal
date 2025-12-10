import { Router } from 'express';
import * as merchandiseController from '../controllers/merchandiseController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Middleware de proteção

const router = Router();

// Rota pública para listar todos os produtos
router.get('/', merchandiseController.getAllMerchandise);

// Rotas protegidas que exigem autenticação e permissão de ADMIN
router.post('/', protect, merchandiseController.createMerchandise);
router.put('/:id', protect, merchandiseController.updateMerchandise);
router.delete('/:id', protect, merchandiseController.deleteMerchandise);

export default router;