import { Service, ServiceVariation, Prisma } from '../lib/generated/prisma';
import prisma from '../config/prisma';

export const createService = async (data: Prisma.ServiceCreateInput): Promise<Service> => {
    return prisma.service.create({
        data,
        include: {
            variations: true,
        },
    });
};

export const createServiceWithVariations = async (
    providerId: string,
    serviceData: {
        name: string;
        description: string;
        category: string;
        photos: string[];
        variations: Array<{
            name: string;
            price: number;
            duration_minutes: number;
        }>;
    }
): Promise<Service> => {
    return prisma.service.create({
        data: {
            providerId,
            name: serviceData.name,
            description: serviceData.description,
            category: serviceData.category,
            photos: serviceData.photos,
            variations: {
                create: serviceData.variations,
            },
        },
        include: {
            variations: true,
        },
    });
};

export const findServiceById = async (id: string): Promise<Service | null> => {
    return prisma.service.findUnique({
        where: { id },
        include: {
            variations: true,
            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
};

export const findServicesByProvider = async (providerId: string, skip?: number, take?: number): Promise<Service[]> => {
    return prisma.service.findMany({
        where: { providerId },
        skip,
        take,
        include: {
            variations: true,
        },
    });
};

export const countServicesByProvider = async (providerId: string): Promise<number> => {
    return prisma.service.count({
        where: { providerId },
    });
};

export const findAllServices = async (skip?: number, take?: number, category?: string): Promise<Service[]> => {
    return prisma.service.findMany({
        where: category ? { category } : undefined,
        skip,
        take,
        include: {
            variations: true,
            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });
};

export const countAllServices = async (category?: string): Promise<number> => {
    return prisma.service.count({
        where: category ? { category } : undefined,
    });
};

export const updateService = async (
    id: string,
    data: Prisma.ServiceUpdateInput
): Promise<Service> => {
    return prisma.service.update({
        where: { id },
        data,
        include: {
            variations: true,
        },
    });
};

export const deleteService = async (id: string): Promise<Service> => {
    // Primeiro deletar todas as variações do serviço
    await prisma.serviceVariation.deleteMany({
        where: { serviceId: id },
    });

    // Depois deletar o serviço
    return prisma.service.delete({
        where: { id },
    });
};

export const findServiceVariationById = async (id: string): Promise<ServiceVariation | null> => {
    return prisma.serviceVariation.findUnique({
        where: { id },
        include: {
            service: true,
        },
    });
};
