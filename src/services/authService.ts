import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../lib/generated/prisma';
import * as userRepository from '../repositories/userRepository';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository';
import * as emailService from './emailService';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/** Register a new user */
export const register = async (data: any): Promise<User> => {
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
        throw new Error('Usuário já existe');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { password, ...userData } = data;
    const user = await userRepository.createUser({
        ...userData,
        password_hash: hashedPassword,
    });

    // Enviar email de boas-vindas (opcional, não bloqueia o registro)
    await emailService.sendWelcomeEmail(user.name, user.email, user.role);

    return user;
};

/** Login and return a JWT containing selected fields */
export const login = async (data: any): Promise<{ token: string; refreshToken: string }> => {
    const user = await userRepository.findUserByEmail(data.email);
    if (!user) {
        throw new Error('Credenciais inválidas');
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }
    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        },
        JWT_SECRET,
        { expiresIn: '7h' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await refreshTokenRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return { token, refreshToken };
};

export const refresh = async (token: string): Promise<{ token: string; refreshToken: string }> => {
    const storedToken = await refreshTokenRepository.findRefreshToken(token);
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new Error('Token de atualização inválido');
    }

    // Revoke old token (Rotation)
    await refreshTokenRepository.revokeRefreshToken(storedToken.id);

    const user = storedToken.user;
    const newAccessToken = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        },
        JWT_SECRET,
        { expiresIn: '7h' }
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return { token: newAccessToken, refreshToken: newRefreshToken };
};
