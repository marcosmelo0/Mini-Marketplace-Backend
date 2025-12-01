import { Request, Response } from 'express';
import { z } from 'zod';
import * as serviceService from '../services/serviceService';


export const getServiceTypes = (req: Request, res: Response) => {
    const types = serviceService.getServiceTypes();
    res.json(types);
};

const createServiceSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    category: z.string().min(2),
    photos: z.array(z.string().url()).optional().default([]),
    variations: z
        .array(
            z.object({
                name: z.string().min(2),
                price: z.number().positive(),
                duration_minutes: z.number().int().positive(),
            })
        )
        .min(1),
});

export const createService = async (req: Request, res: Response) => {
    try {
        const data = createServiceSchema.parse(req.body);
        const providerId = (req as any).user.id;

        const service = await serviceService.createService(providerId, data);
        res.status(201).json(service);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

export const getService = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const service = await serviceService.getServiceById(id);
        res.json(service);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

export const getServices = async (req: Request, res: Response) => {
    try {
        // Extrair parâmetros de paginação e filtro
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const category = req.query.category as string | undefined;
        const sort = req.query.sort as string | undefined;
        const order = req.query.order as string | undefined;

        const result = await serviceService.getAllServices(page, limit, category, sort, order);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProviderServices = async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await serviceService.getServicesByProvider(providerId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const updateServiceSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
    photos: z.array(z.string().url()).optional(),
});

export const updateService = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const providerId = (req as any).user.id;
        const data = updateServiceSchema.parse(req.body);
        const service = await serviceService.updateService(id, providerId, data);
        res.json(service);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else if (error.message === 'Service not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const providerId = (req as any).user.id;
        await serviceService.deleteService(id, providerId);
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else if (error.message === 'Service not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};
