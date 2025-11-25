import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await notificationService.getProviderNotifications(providerId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const providerId = (req as any).user.id;

        const result = await notificationService.markAsRead(id, providerId);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'Notification not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized') {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user.id;
        const count = await notificationService.getUnreadCount(providerId);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
