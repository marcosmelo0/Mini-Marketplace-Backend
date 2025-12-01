import { Booking, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export type BookingWithVariation = Prisma.BookingGetPayload<{
    include: {
        client: true;
        serviceVariation: {
            include: {
                service: {
                    include: {
                        provider: {
                            select: {
                                id: true;
                                name: true;
                                email: true;
                            }
                        }
                    }
                }
            }
        }
    }
}>;

export const createBooking = async (data: Prisma.BookingCreateInput): Promise<Booking> => {
    return prisma.booking.create({
        data,
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            serviceVariation: {
                include: {
                    service: {
                        include: {
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const findBookingById = async (id: string): Promise<BookingWithVariation | null> => {
    return prisma.booking.findUnique({
        where: { id },
        include: {
            client: true,
            serviceVariation: {
                include: {
                    service: {
                        include: {
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

export const findBookingsByClient = async (clientId: string, skip?: number, take?: number): Promise<BookingWithVariation[]> => {
    return prisma.booking.findMany({
        where: { clientId },
        skip,
        take,
        include: {
            client: true,
            serviceVariation: {
                include: {
                    service: {
                        include: {
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            start_time: 'desc',
        },
    });
};

export const countBookingsByClient = async (clientId: string): Promise<number> => {
    return prisma.booking.count({
        where: { clientId },
    });
};

export const findBookingsByProvider = async (providerId: string, skip?: number, take?: number): Promise<Booking[]> => {
    return prisma.booking.findMany({
        where: {
            serviceVariation: {
                service: {
                    providerId,
                },
            },
        },
        skip,
        take,
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            serviceVariation: {
                include: {
                    service: true,
                },
            },
        },
        orderBy: {
            start_time: 'desc',
        },
    });
};

export const countBookingsByProvider = async (providerId: string): Promise<number> => {
    return prisma.booking.count({
        where: {
            serviceVariation: {
                service: {
                    providerId,
                },
            },
        },
    });
};

export const checkBookingConflict = async (
    serviceVariationId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
): Promise<boolean> => {
    const conflictingBooking = await prisma.booking.findFirst({
        where: {
            serviceVariationId,
            status: 'CONFIRMED',
            AND: [
                {
                    start_time: {
                        lt: endTime,
                    },
                },
                {
                    end_time: {
                        gt: startTime,
                    },
                },
            ],
            ...(excludeBookingId && {
                id: {
                    not: excludeBookingId,
                },
            }),
        },
    });

    return !!conflictingBooking;
};

export const updateBookingStatus = async (
    id: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Promise<Booking> => {
    return prisma.booking.update({
        where: { id },
        data: { status },
        include: {
            client: true,
            serviceVariation: {
                include: {
                    service: true,
                },
            },
        },
    });
};

/**
 * Buscar agendamentos confirmados de um prestador em uma data específica
 */
export const findBookingsByProviderAndDate = async (
    providerId: string,
    date: Date
): Promise<Booking[]> => {
    // Início e fim do dia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.booking.findMany({
        where: {
            serviceVariation: {
                service: {
                    providerId,
                },
            },
            status: 'CONFIRMED',
            start_time: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        orderBy: {
            start_time: 'asc',
        },
    });
};
