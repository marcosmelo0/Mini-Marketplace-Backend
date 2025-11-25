import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.get('/my-notifications', authenticate, requireRole('PROVIDER'), notificationController.getMyNotifications);
router.get('/unread-count', authenticate, requireRole('PROVIDER'), notificationController.getUnreadCount);
router.patch('/:id/read', authenticate, requireRole('PROVIDER'), notificationController.markAsRead);

export default router;
