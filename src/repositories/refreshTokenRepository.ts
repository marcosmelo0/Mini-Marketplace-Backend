import prisma from '../config/prisma';

export const createRefreshToken = async (userId: string, token: string, expiresAt: Date) => {
    return prisma.refreshToken.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });
};

export const findRefreshToken = async (token: string) => {
    return prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
};

export const revokeRefreshToken = async (id: string) => {
    return prisma.refreshToken.update({
        where: { id },
        data: { revoked: true },
    });
};
