import { Notification, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export const createNotification = async (data: Prisma.NotificationCreateInput): Promise<Notification> => {
    return prisma.notification.create({
        data,
        include: {
            booking: {
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    serviceVariation: {
                        include: {
                            service: true,
                        },
                    },
                },
            },
        },
    });
};

export const findNotificationsByProvider = async (
    providerId: string,
    skip?: number,
    take?: number
): Promise<Notification[]> => {
    return prisma.notification.findMany({
        where: { providerId },
        skip,
        take,
        include: {
            booking: {
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    serviceVariation: {
                        include: {
                            service: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const countNotificationsByProvider = async (providerId: string): Promise<number> => {
    return prisma.notification.count({
        where: { providerId },
    });
};

export const countUnreadNotifications = async (providerId: string): Promise<number> => {
    return prisma.notification.count({
        where: {
            providerId,
            read: false,
        },
    });
};

export const markAsRead = async (id: string): Promise<Notification> => {
    return prisma.notification.update({
        where: { id },
        data: { read: true },
    });
};

export const findNotificationById = async (id: string): Promise<Notification | null> => {
    return prisma.notification.findUnique({
        where: { id },
    });
};
