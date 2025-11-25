import * as serviceRepository from '../repositories/serviceRepository';
import { getPopularServiceIds, getServiceViews } from '../config/redis';

/**
 * Obter serviços mais populares baseado em visualizações
 */
export const getPopularServices = async (page: number = 1, limit: number = 10) => {
    try {
        // Calcular skip baseado na página
        const skip = (page - 1) * limit;

        // Buscar mais IDs do que o necessário para paginação
        // (buscar limit * page para ter dados suficientes)
        const totalToFetch = limit * page + limit;
        const serviceIds = await getPopularServiceIds(totalToFetch);

        if (serviceIds.length === 0) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }

        // Buscar dados completos dos serviços
        const allServices = await Promise.all(
            serviceIds.map(async (id) => {
                const service = await serviceRepository.findServiceById(id);
                if (!service) return null;

                // Adicionar contagem de visualizações
                const views = await getServiceViews(id);
                return {
                    ...service,
                    views,
                };
            })
        );

        // Filtrar nulls (serviços que foram deletados)
        const validServices = allServices.filter((s) => s !== null);

        // Aplicar paginação
        const paginatedServices = validServices.slice(skip, skip + limit);

        return {
            data: paginatedServices,
            pagination: {
                page,
                limit,
                total: validServices.length,
                totalPages: Math.ceil(validServices.length / limit),
            },
        };
    } catch (error) {
        console.error('Error getting popular services:', error);
        return {
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }
};
