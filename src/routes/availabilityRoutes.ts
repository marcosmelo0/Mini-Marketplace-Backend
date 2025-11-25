import { Router } from 'express';
import * as availabilityController from '../controllers/availabilityController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, requireRole('PROVIDER'), availabilityController.createAvailability);
router.get('/my-availabilities', authenticate, requireRole('PROVIDER'), availabilityController.getMyAvailabilities);
router.put('/:id', authenticate, requireRole('PROVIDER'), availabilityController.updateAvailability);
router.delete('/:id', authenticate, requireRole('PROVIDER'), availabilityController.deleteAvailability);

export default router;
