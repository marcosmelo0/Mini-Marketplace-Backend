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

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 1 * 60 * 60 * 1000, 
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: 'Login realizado com sucesso' });
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
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Token de atualização é obrigatório' });
        }

        const tokens = await authService.refresh(refreshToken);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', tokens.token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 1 * 60 * 60 * 1000,
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: 'Token atualizado com sucesso' });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


