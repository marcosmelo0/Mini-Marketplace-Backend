import { Request, Response } from 'express';
import * as searchService from '../services/searchService';
import { saveRecentSearch, getRecentSearches } from '../config/redis';

export const search = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        // Salvar busca recente se usuário estiver autenticado
        const user = (req as any).user;
        if (user?.id) {
            await saveRecentSearch(user.id, query);
        }

        const results = await searchService.searchServices(query, page, limit);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obter buscas recentes do usuário autenticado
 */
export const getRecent = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const searches = await getRecentSearches(user.id);
        res.json({ searches });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
