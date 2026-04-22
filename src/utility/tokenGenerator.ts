import { tokenPayloadDTO } from "../types/auth.types";
import jwt from "jsonwebtoken"
import { env } from '../config/env'

export const generateAccessToken = (payload: tokenPayloadDTO): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET as string, { expiresIn: env.JWT_ACCESS_EXPIRE_IN } as jwt.SignOptions)
}
export const generateRefreshToken = (payload: tokenPayloadDTO): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET as string, { expiresIn: env.JWT_REFRESH_EXPIRE_IN } as jwt.SignOptions)
}