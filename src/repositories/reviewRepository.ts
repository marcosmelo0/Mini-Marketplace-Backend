import { Review, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export const createReview = async (data: Prisma.ReviewCreateInput): Promise<Review> => {
    return prisma.review.create({
        data,
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const findReviewsByService = async (serviceId: string, skip?: number, take?: number): Promise<Review[]> => {
    return prisma.review.findMany({
        where: { serviceId },
        skip,
        take,
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const findReviewById = async (id: string): Promise<Review | null> => {
    return prisma.review.findUnique({
        where: { id },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const getAverageRating = async (serviceId: string): Promise<number> => {
    const result = await prisma.review.aggregate({
        where: { serviceId },
        _avg: {
            rating: true,
        },
    });

    return result._avg.rating || 0;
};

export const countReviews = async (serviceId: string): Promise<number> => {
    return prisma.review.count({
        where: { serviceId },
    });
};

export const hasUserReviewed = async (serviceId: string, clientId: string): Promise<boolean> => {
    const review = await prisma.review.findUnique({
        where: {
            serviceId_clientId: {
                serviceId,
                clientId,
            },
        },
    });

    return !!review;
};
