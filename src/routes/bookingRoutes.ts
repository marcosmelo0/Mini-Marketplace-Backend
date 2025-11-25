import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Client routes
router.post('/', authenticate, bookingController.createBooking);
router.get('/client/my-bookings', authenticate, bookingController.getClientBookings);

// Provider routes
router.get(
    '/provider/my-bookings',
    authenticate,
    requireRole('PROVIDER'),
    bookingController.getProviderBookings
);

// Both client and provider can cancel
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;
