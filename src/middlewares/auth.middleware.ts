import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utility/responseHelper";
import Jwt from 'jsonwebtoken';
import { env } from "../config/env";
import { tokenPayloadDTO } from "../types/auth.types";

// 1. Extend the Request interface to include the user property
// This allows TypeScript to recognize req.user without errors
declare global {
    namespace Express {
        interface Request {
            user?: tokenPayloadDTO;
        }
    }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Get token from Authorization header (format: Bearer <token>)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Use 'return' to stop execution if no token is provided
        return res.status(401).json(errorResponse('Unauthorized: No token provided'));
    }

    try {
        // Use 'verify' instead of 'sign' to check if the token is valid
        const decoded = Jwt.verify(token, env.JWT_ACCESS_SECRET as string) as tokenPayloadDTO;
        
        // Attach decoded data to req.user for use in subsequent middlewares or controllers
        req.user = decoded;
        
        next(); // Move to the next middleware or route handler
    } catch (error) {
        return res.status(401).json(errorResponse('Unauthorized: Invalid or expired token'));
    }
};

/**
 * Middleware factory to authorize requests based on roles (RBAC)
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Check if the user was attached to the request by the authenticate middleware
        if (!req.user) {
            return res.status(401).json(errorResponse('Unauthorized: No user context found'));
        }

        // Check if the user's role is included in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(errorResponse('Forbidden: You do not have permission to perform this action'));
        }

        next(); // User has sufficient permission, proceed
    };
};