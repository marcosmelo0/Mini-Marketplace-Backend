import { prisma } from '../config/prisma';
import { esClient, SERVICE_INDEX, createServiceIndex } from '../config/elasticsearch';

async function reindex() {
    try {
        console.log('Starting reindexing process...');

        // 1. Check if index exists and delete it
        const indexExists = await esClient.indices.exists({ index: SERVICE_INDEX });
        if (indexExists) {
            console.log(`Deleting existing index: ${SERVICE_INDEX}`);
            await esClient.indices.delete({ index: SERVICE_INDEX });
        }

        // 2. Create new index
        console.log('Creating new index...');
        await createServiceIndex();

        // 3. Fetch all services from DB
        console.log('Fetching services from database...');
        const services = await prisma.service.findMany({
            include: {
                provider: true,
                variations: true,
            },
        });

        console.log(`Found ${services.length} services to index.`);

        if (services.length === 0) {
            console.log('No services to index.');
            return;
        }

        // 4. Bulk index
        const body = services.flatMap((service) => [
            { index: { _index: SERVICE_INDEX, _id: service.id } },
            {
                name: service.name,
                description: service.description,
                category: service.category,
                providerId: service.providerId,
                // Add other fields as needed for search
            },
        ]);

        const { errors, items } = await esClient.bulk({ refresh: true, body });

        if (errors) {
            const erroredItems = items.filter((item: any) => item.index && item.index.error);
            console.error('Errors during bulk indexing:', erroredItems);
        } else {
            console.log(`Successfully indexed ${items.length} items.`);
        }

    } catch (error) {
        console.error('Reindexing failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reindex();
