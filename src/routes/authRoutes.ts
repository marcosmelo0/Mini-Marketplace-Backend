import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);

export default router;
