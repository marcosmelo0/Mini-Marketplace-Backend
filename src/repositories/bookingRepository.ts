import { Booking, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export type BookingWithVariation = Prisma.BookingGetPayload<{
    include: {
        serviceVariation: {
            include: {
                service: true
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
                    service: true,
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
            serviceVariation: {
                include: {
                    service: {
                        include: {
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
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
