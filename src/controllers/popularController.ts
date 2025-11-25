import { Request, Response } from 'express';
import * as popularService from '../services/popularService';

/**
 * Obter serviços mais populares
 */
export const getPopular = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const result = await popularService.getPopularServices(page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
