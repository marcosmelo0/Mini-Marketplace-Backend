import { esClient, SERVICE_INDEX, createServiceIndex } from './elasticsearch';
import { prisma } from './prisma';
import * as searchService from '../services/searchService';

/**
 * Inicializa o Elasticsearch e reindexar serviços se necessário
 */
export async function initializeSearchIndex() {
    try {
        // 1. Criar o índice se não existir
        await createServiceIndex();

        // 2. Verificar se há documentos no índice
        const count = await esClient.count({ index: SERVICE_INDEX });
        const indexedCount = count.count;

        // 3. Contar serviços no banco de dados
        const dbCount = await prisma.service.count();

        console.log(`Elasticsearch: ${indexedCount} serviços indexados`);
        console.log(`PostgreSQL: ${dbCount} serviços no banco`);

        // 4. Se o índice estiver vazio mas houver serviços no banco, reindexar
        if (indexedCount === 0 && dbCount > 0) {
            console.log('Iniciando reindexação automática...');
            await reindexAllServices();
        } else if (indexedCount !== dbCount) {
            console.log(`⚠️  Aviso: Diferença entre índice (${indexedCount}) e banco (${dbCount})`);
            console.log('Execute "npm run reindex" para sincronizar');
        } else {
            console.log('✓ Índice de busca sincronizado');
        }
    } catch (error) {
        console.error('Erro ao inicializar índice de busca:', error);
        throw error;
    }
}

/**
 * Reindexar todos os serviços do banco de dados
 */
async function reindexAllServices() {
    try {
        const services = await prisma.service.findMany({
            include: {
                variations: true,
            },
        });

        console.log(`Indexando ${services.length} serviços...`);

        for (const service of services) {
            await searchService.indexService(service);
        }

        console.log('✓ Reindexação concluída com sucesso!');
    } catch (error) {
        console.error('Erro ao reindexar serviços:', error);
        throw error;
    }
}
