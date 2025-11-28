import { Router } from 'express';
import * as searchController from '../controllers/searchController';
import { authenticate, optionalAuth } from '../middlewares/auth';

const router = Router();

// Busca pública (com autenticação opcional para salvar histórico)
router.get('/', optionalAuth, searchController.search);

// Buscas recentes (requer autenticação)
router.get('/recent', authenticate, searchController.getRecent);

export default router;
