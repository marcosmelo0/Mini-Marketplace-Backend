import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rotas de autenticação (login, register)
 * Limite: 5 requisições por 15 minutos
 */

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: {
        error: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter para criação de recursos (serviços, agendamentos)
 * Limite: 20 requisições por 15 minutos
 */

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20,
    message: {
        error: 'Muitas requisições de criação. Tente novamente em 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
