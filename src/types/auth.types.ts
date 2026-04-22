import { number } from "zod";

// Authentication Database Row Structure
interface UserEntity {
    userId: number;
    fullname: string;
    email: string;
    passwordHash: string;
    role: 'user' | "admin";
    isVerified: boolean;
    createdAt: string,
    lockedUntil: string
}

interface EmailVerificationTokensEntity {
    id: number;
    userId: number;
    token: string;
    expiresAt: string;
    createdAt: string

}

interface SessionEntity {
    id: number;
    userId: number;
    deviceInfo: string;
    ipAddress: string;
    createdAt: string;
}

interface RefreshTokenEntity {
    id: number;
    userId: number;
    token: string;
    expiresAt: string;
    createdAt: string;
}


interface passwordResetTokenEntity {
    id: number;
    userId: number;
    token: string;
    expiresAt: string;
    createdAt: string;
}

interface AttemptTimeEntity {
    id: number;
    userId: number;
    attemptTime: string,
    ip: string
}

interface CountResult {
  count: string;
}

// Authentication Request Body Shape 
interface SignupRequestDTO {
    fullname: string;
    email: string;
    password: string;
}

interface signInRequestDTO {
    email: string;
    password: string;
}




interface VerificationTokensDTO {
    token: string
}

interface tokenPayloadDTO {
    userId: number;
    email: string;
    role: string;
}


interface ForgotPasswordDTO {
    email: string;
}

interface resetPasswordDTO {

    token: string;
    newPassword: string;
}
export {
    UserEntity,
    EmailVerificationTokensEntity,
    passwordResetTokenEntity,
    SessionEntity,
    RefreshTokenEntity,
    AttemptTimeEntity,
    CountResult, 
    SignupRequestDTO,
    VerificationTokensDTO,
    signInRequestDTO,
    tokenPayloadDTO,
    ForgotPasswordDTO,
    resetPasswordDTO
}

