import { Availability, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export const createAvailability = async (data: Prisma.AvailabilityCreateInput): Promise<Availability> => {
    return prisma.availability.create({
        data,
    });
};

export const findAvailabilitiesByProvider = async (
    providerId: string,
    skip?: number,
    take?: number
): Promise<Availability[]> => {
    return prisma.availability.findMany({
        where: { providerId },
        skip,
        take,
        orderBy: [
            { day_of_week: 'asc' },
            { start_time: 'asc' },
        ],
    });
};

export const countAvailabilitiesByProvider = async (providerId: string): Promise<number> => {
    return prisma.availability.count({
        where: { providerId },
    });
};

export const findAvailabilityById = async (id: string): Promise<Availability | null> => {
    return prisma.availability.findUnique({
        where: { id },
    });
};

export const updateAvailability = async (
    id: string,
    data: Prisma.AvailabilityUpdateInput
): Promise<Availability> => {
    return prisma.availability.update({
        where: { id },
        data,
    });
};

export const deleteAvailability = async (id: string): Promise<Availability> => {
    return prisma.availability.delete({
        where: { id },
    });
};

/**
 * Buscar disponibilidades de um prestador para um dia específico da semana
 */
export const findAvailabilitiesByProviderAndDay = async (
    providerId: string,
    dayOfWeek: number
): Promise<Availability[]> => {
    return prisma.availability.findMany({
        where: {
            providerId,
            day_of_week: dayOfWeek,
        },
        orderBy: {
            start_time: 'asc',
        },
    });
};

export const checkAvailabilityConflict = async (
    providerId: string,
    dayOfWeek: number,
    startTime: Date,
    endTime: Date,
    excludeId?: string
): Promise<boolean> => {
    const conflicts = await prisma.availability.findMany({
        where: {
            providerId,
            day_of_week: dayOfWeek,
            id: excludeId ? { not: excludeId } : undefined,
            OR: [
                {
                    AND: [
                        { start_time: { lte: startTime } },
                        { end_time: { gt: startTime } },
                    ],
                },
                {
                    AND: [
                        { start_time: { lt: endTime } },
                        { end_time: { gte: endTime } },
                    ],
                },
                {
                    AND: [
                        { start_time: { gte: startTime } },
                        { end_time: { lte: endTime } },
                    ],
                },
            ],
        },
    });

    return conflicts.length > 0;
};
