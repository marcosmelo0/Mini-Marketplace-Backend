import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';
import * as popularController from '../controllers/popularController';
import { authenticate, requireRole } from '../middlewares/auth';
import { strictLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes
router.get('/types', serviceController.getServiceTypes);
router.get('/', serviceController.getServices);
router.get('/popular', popularController.getPopular); // Serviços populares
router.get('/:id', serviceController.getService);

// Provider routes
router.post('/', authenticate, requireRole('PROVIDER'), strictLimiter, serviceController.createService);
router.get(
    '/provider/my-services',
    authenticate,
    requireRole('PROVIDER'),
    serviceController.getProviderServices
);
router.put('/:id', authenticate, requireRole('PROVIDER'), serviceController.updateService);
router.delete('/:id', authenticate, requireRole('PROVIDER'), serviceController.deleteService);

export default router;
