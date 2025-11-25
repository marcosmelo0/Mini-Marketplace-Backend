import { Request, Response } from 'express';
import { z } from 'zod';
import * as bookingService from '../services/bookingService';

const createBookingSchema = z.object({
    serviceVariationId: z.string().uuid(),
    start_time: z.string(), // Aceita qualquer string de data válida
});

export const createBooking = async (req: Request, res: Response) => {
    try {
        const data = createBookingSchema.parse(req.body);
        const clientId = (req as any).user.id;

        const booking = await bookingService.createBooking(clientId, {
            serviceVariationId: data.serviceVariationId,
            start_time: new Date(data.start_time),
        });
        res.status(201).json(booking);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

export const getClientBookings = async (req: Request, res: Response) => {
    try {
        const clientId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await bookingService.getBookingsByClient(clientId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProviderBookings = async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await bookingService.getBookingsByProvider(providerId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const booking = await bookingService.cancelBooking(bookingId, userId, userRole);
        res.json(booking);
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else if (error.message === 'Booking not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};
