import { User, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
    return prisma.user.create({
        data,
    });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const findUserById = async (id: string): Promise<User | null> => {
    return prisma.user.findUnique({
        where: { id },
    });
};

export const findAllProviders = async (skip?: number, take?: number): Promise<User[]> => {
    return prisma.user.findMany({
        where: { role: 'PROVIDER' },
        skip,
        take,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true,
            updated_at: true,
            password_hash: false,
        },
    }) as unknown as Promise<User[]>;
};

export const countProviders = async (): Promise<number> => {
    return prisma.user.count({
        where: { role: 'PROVIDER' },
    });
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput): Promise<User> => {
    return prisma.user.update({
        where: { id },
        data,
    });
};
