import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rotas de autenticação (login, register)
 * Limite: 5 requisições por 15 minutos
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 requisições por IP
    message: {
        error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    },
    standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

/**
 * Rate limiter para criação de recursos (serviços, agendamentos)
 * Limite: 20 requisições por 15 minutos
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 requisições por IP
    message: {
        error: 'Muitas requisições de criação. Tente novamente em 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
