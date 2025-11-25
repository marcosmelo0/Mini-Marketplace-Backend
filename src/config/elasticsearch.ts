import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const esClient = new Client({
    node: ELASTICSEARCH_URL,
});

export const SERVICE_INDEX = 'services';

export const createServiceIndex = async () => {
    const indexExists = await esClient.indices.exists({ index: SERVICE_INDEX });

    if (!indexExists) {
        await esClient.indices.create({
            index: SERVICE_INDEX,
            mappings: {
                properties: {
                    name: { type: 'text' },
                    description: { type: 'text' },
                    category: { type: 'keyword' },
                    price: { type: 'float' },
                    providerId: { type: 'keyword' },
                },
            },
        });
        console.log(`Index ${SERVICE_INDEX} created.`);
    }
};
