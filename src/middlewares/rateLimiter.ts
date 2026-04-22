import rateLimiter from 'express-rate-limit';


export const globalLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
})
export const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many login attempts, please wait 5 minutes.',
    standardHeaders: true,
    legacyHeaders: false
})
