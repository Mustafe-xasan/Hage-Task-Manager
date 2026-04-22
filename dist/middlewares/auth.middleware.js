"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const responseHelper_1 = require("../utility/responseHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
    // Get token from Authorization header (format: Bearer <token>)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // Use 'return' to stop execution if no token is provided
        return res.status(401).json((0, responseHelper_1.errorResponse)('Unauthorized: No token provided'));
    }
    try {
        // Use 'verify' instead of 'sign' to check if the token is valid
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        // Attach decoded data to req.user for use in subsequent middlewares or controllers
        req.user = decoded;
        next(); // Move to the next middleware or route handler
    }
    catch (error) {
        return res.status(401).json((0, responseHelper_1.errorResponse)('Unauthorized: Invalid or expired token'));
    }
};
exports.authenticate = authenticate;
/**
 * Middleware factory to authorize requests based on roles (RBAC)
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // Check if the user was attached to the request by the authenticate middleware
        if (!req.user) {
            return res.status(401).json((0, responseHelper_1.errorResponse)('Unauthorized: No user context found'));
        }
        // Check if the user's role is included in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json((0, responseHelper_1.errorResponse)('Forbidden: You do not have permission to perform this action'));
        }
        next(); // User has sufficient permission, proceed
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map