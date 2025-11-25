import { Router } from 'express';
import * as searchController from '../controllers/searchController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Busca pública
router.get('/', searchController.search);

// Buscas recentes (requer autenticação)
router.get('/recent', authenticate, searchController.getRecent);

export default router;
