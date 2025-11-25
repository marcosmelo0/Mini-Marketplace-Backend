import { Request, Response } from 'express';
import * as availabilityService from '../services/availabilityService';
import { z } from 'zod';

const createAvailabilitySchema = z.object({
    day_of_week: z.number().min(0).max(6), // 0 = Domingo, 6 = Sábado
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
});

const updateAvailabilitySchema = createAvailabilitySchema.partial();

export const createAvailability = async (req: Request, res: Response) => {
    try {
        const data = createAvailabilitySchema.parse(req.body);
        const providerId = (req as any).user.id;

        const availability = await availabilityService.createAvailability(providerId, data);
        res.status(201).json(availability);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if (error.message === 'Start time must be before end time' || error.message === 'Availability conflicts with existing slot') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getMyAvailabilities = async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await availabilityService.getAvailabilitiesByProvider(providerId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateAvailabilitySchema.parse(req.body);
        const providerId = (req as any).user.id;

        const availability = await availabilityService.updateAvailability(id, providerId, data);
        res.json(availability);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if (error.message === 'Availability not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else if (error.message === 'Start time must be before end time' || error.message === 'Availability conflicts with existing slot') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const deleteAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const providerId = (req as any).user.id;

        await availabilityService.deleteAvailability(id, providerId);
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Availability not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
