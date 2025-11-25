import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Criar cliente Redis
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

// Tratamento de erros
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('✓ Redis connected');
});

// Funções utilitárias de cache
const DEFAULT_TTL = 300; // 5 minutos em segundos

/**
 * Obter valor do cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
}

/**
 * Salvar valor no cache
 */
export async function setCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting cache for key ${key}:`, error);
    }
}

/**
 * Deletar uma chave específica do cache
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Error deleting cache for key ${key}:`, error);
    }
}

/**
 * Deletar múltiplas chaves que correspondem a um padrão
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error(`Error deleting cache pattern ${pattern}:`, error);
    }
}

// ============================================
// FUNCIONALIDADES AVANÇADAS
// ============================================

/**
 * Salvar busca recente do usuário (últimas 10)
 */
export async function saveRecentSearch(userId: string, query: string): Promise<void> {
    try {
        const key = `user:${userId}:recent_searches`;
        // Adicionar no início da lista
        await redis.lpush(key, query);
        // Manter apenas as 10 mais recentes
        await redis.ltrim(key, 0, 9);
        // Expirar após 30 dias
        await redis.expire(key, 30 * 24 * 60 * 60);
    } catch (error) {
        console.error(`Error saving recent search for user ${userId}:`, error);
    }
}

/**
 * Obter buscas recentes do usuário
 */
export async function getRecentSearches(userId: string): Promise<string[]> {
    try {
        const key = `user:${userId}:recent_searches`;
        const searches = await redis.lrange(key, 0, 9);
        // Remover duplicatas mantendo ordem
        return [...new Set(searches)];
    } catch (error) {
        console.error(`Error getting recent searches for user ${userId}:`, error);
        return [];
    }
}

/**
 * Incrementar visualizações de um serviço e atualizar ranking
 */
export async function incrementServiceViews(serviceId: string): Promise<void> {
    try {
        // Incrementar contador de visualizações
        await redis.incr(`service:${serviceId}:views`);
        // Adicionar ao ranking de populares (sorted set)
        await redis.zincrby('popular_services', 1, serviceId);
    } catch (error) {
        console.error(`Error incrementing views for service ${serviceId}:`, error);
    }
}

/**
 * Obter serviços mais populares (IDs)
 */
export async function getPopularServiceIds(limit: number = 10): Promise<string[]> {
    try {
        // Buscar top N serviços por score (visualizações) em ordem decrescente
        return await redis.zrevrange('popular_services', 0, limit - 1);
    } catch (error) {
        console.error('Error getting popular services:', error);
        return [];
    }
}

/**
 * Obter número de visualizações de um serviço
 */
export async function getServiceViews(serviceId: string): Promise<number> {
    try {
        const views = await redis.get(`service:${serviceId}:views`);
        return views ? parseInt(views, 10) : 0;
    } catch (error) {
        console.error(`Error getting views for service ${serviceId}:`, error);
        return 0;
    }
}

/**
 * Cachear slots disponíveis de um prestador para uma data
 */
export async function cacheAvailableSlots(providerId: string, date: string, slots: any[]): Promise<void> {
    try {
        const key = `slots:${providerId}:${date}`;
        await redis.setex(key, 300, JSON.stringify(slots)); // 5 minutos
    } catch (error) {
        console.error(`Error caching slots for provider ${providerId}:`, error);
    }
}

/**
 * Obter slots disponíveis do cache
 */
export async function getCachedSlots(providerId: string, date: string): Promise<any[] | null> {
    try {
        const key = `slots:${providerId}:${date}`;
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error getting cached slots for provider ${providerId}:`, error);
        return null;
    }
}

/**
 * Invalidar cache de slots de um prestador para uma data
 */
export async function invalidateSlots(providerId: string, date: string): Promise<void> {
    try {
        const key = `slots:${providerId}:${date}`;
        await redis.del(key);
    } catch (error) {
        console.error(`Error invalidating slots for provider ${providerId}:`, error);
    }
}

export default redis;
