import { Request, Response } from 'express';
import * as reviewService from '../services/reviewService';
import { z } from 'zod';

const createReviewSchema = z.object({
    serviceId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export const createReview = async (req: Request, res: Response) => {
    try {
        const { serviceId, rating, comment } = createReviewSchema.parse(req.body);
        const userId = (req as any).user.id; // Corrigido de user.userId para user.id

        const review = await reviewService.createReview(userId, serviceId, rating, comment);
        res.status(201).json(review);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else if (error.message === 'Serviço não encontrado') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Você só pode avaliar serviços que agendou') {
            res.status(403).json({ error: error.message });
        } else if (error.message === 'Você já avaliou este serviço') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

export const getReviewsByService = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await reviewService.getReviewsByService(serviceId, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
