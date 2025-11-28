import { esClient, SERVICE_INDEX } from '../config/elasticsearch';

export const indexService = async (service: any) => {
    try {
        await esClient.index({
            index: SERVICE_INDEX,
            id: service.id,
            document: {
                name: service.name,
                description: service.description,
                // category: service.category, // Assuming category exists or will be added
                providerId: service.providerId,
                // price: service.basePrice, // Assuming basePrice exists or we use variation prices
            },
        });
        console.log(`Service ${service.id} indexed.`);
    } catch (error) {
        console.error(`Error indexing service ${service.id}:`, error);
    }
};

export const removeService = async (serviceId: string) => {
    try {
        await esClient.delete({
            index: SERVICE_INDEX,
            id: serviceId,
        });
        console.log(`Service ${serviceId} removed from index.`);
    } catch (error) {
        console.error(`Error removing service ${serviceId} from index:`, error);
    }
};

import { prisma } from '../config/prisma';

// ... existing imports

export const searchServices = async (query: string, page: number = 1, limit: number = 20) => {
    try {
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 100);
        const from = (validPage - 1) * validLimit;

        const result = await esClient.search({
            index: SERVICE_INDEX,
            from,
            size: validLimit,
            query: {
                multi_match: {
                    query: query,
                    fields: ['name', 'description'],
                    fuzziness: 'AUTO',
                },
            },
        });

        const ids = result.hits.hits.map((hit) => hit._id);

        if (ids.length === 0) {
            return {
                data: [],
                pagination: {
                    total: 0,
                    page: validPage,
                    limit: validLimit,
                    totalPages: 0,
                },
            };
        }

        // Buscar detalhes completos no banco de dados
        const services = await prisma.service.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                variations: true,
            },
        });

        // Ordenar os resultados do banco na mesma ordem do Elasticsearch
        const serviceMap = new Map(services.map(s => [s.id, s]));
        const data = ids
            .map(id => serviceMap.get(id))
            .filter(item => item !== undefined);

        return {
            data,
            pagination: {
                total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
                page: validPage,
                limit: validLimit,
                totalPages: Math.ceil((typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0) / validLimit),
            },
        };
    } catch (error) {
        console.error('Error searching services:', error);
        return {
            data: [],
            pagination: {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            },
        };
    }
};
