import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(['CLIENT', 'PROVIDER']).optional(),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await authService.register(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);
        const { token, refreshToken } = await authService.login(data);
        res.json({ token, refreshToken });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            res.status(401).json({ error: error.message });
        }
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const tokens = await authService.refresh(refreshToken);
        res.json(tokens);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};


