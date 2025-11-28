import * as serviceRepository from '../repositories/serviceRepository';
import * as searchService from './searchService';
import { getCache, setCache, deleteCachePattern, incrementServiceViews } from '../config/redis';

export const SERVICE_TYPES = [
    'Manicure',
    'Cabelereiro',
    'Barbeiro',
    'Maquiagem',
    'Massagem',
    'Eletricista',
    'Encanador',
    'Jardineiro',
    'Diarista',
    'Personal Trainer',
    'Fotógrafo',
    'Outros'
];

export const getServiceTypes = () => {
    return SERVICE_TYPES;
};

export const createService = async (providerId: string, data: any) => {
    const service = await serviceRepository.createServiceWithVariations(providerId, data);
    await searchService.indexService(service);
    // Invalidar cache de listagem
    await deleteCachePattern('services:all:*');
    return service;
};

export const getServiceById = async (id: string) => {
    // Tentar buscar do cache
    const cacheKey = `service:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        // Incrementar visualizações mesmo se vier do cache
        await incrementServiceViews(id);
        return cached;
    }

    const service = await serviceRepository.findServiceById(id);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }

    // Incrementar visualizações
    await incrementServiceViews(id);

    // Salvar no cache por 10 minutos
    await setCache(cacheKey, service, 600);
    return service;
};

export const getServicesByProvider = async (providerId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        serviceRepository.findServicesByProvider(providerId, skip, limit),
        serviceRepository.countServicesByProvider(providerId),
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getAllServices = async (page: number = 1, limit: number = 20, category?: string) => {
    // Validar parâmetros
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Máximo 100 por página

    // Tentar buscar do cache
    const cacheKey = `services:all:${validPage}:${validLimit}:${category || 'all'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return cached;
    }

    const skip = (validPage - 1) * validLimit;
    const [data, total] = await Promise.all([
        serviceRepository.findAllServices(skip, validLimit, category),
        serviceRepository.countAllServices(category),
    ]);

    const result = {
        data,
        pagination: {
            total,
            page: validPage,
            limit: validLimit,
            totalPages: Math.ceil(total / validLimit),
        },
    };

    // Salvar no cache por 5 minutos
    await setCache(cacheKey, result, 300);
    return result;
};

export const updateService = async (id: string, providerId: string, data: any) => {
    const service = await serviceRepository.findServiceById(id);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }
    if (service.providerId !== providerId) {
        throw new Error('Não autorizado');
    }
    const updatedService = await serviceRepository.updateService(id, data);
    await searchService.indexService(updatedService);
    // Invalidar cache do serviço e da listagem
    await deleteCachePattern(`service:${id}`);
    await deleteCachePattern('services:all:*');
    return updatedService;
};

export const deleteService = async (id: string, providerId: string) => {
    const service = await serviceRepository.findServiceById(id);
    if (!service) {
        throw new Error('Serviço não encontrado');
    }
    if (service.providerId !== providerId) {
        throw new Error('Não autorizado');
    }
    await serviceRepository.deleteService(id);
    await searchService.removeService(id);
    // Invalidar cache do serviço e da listagem
    await deleteCachePattern(`service:${id}`);
    await deleteCachePattern('services:all:*');
    return;
};
