import { Request, Response, NextFunction } from "express";
import {
    SignupRequestDTO,
    VerificationTokensDTO,
    signInRequestDTO,
    ForgotPasswordDTO,
    resetPasswordDTO
} from "../types/auth.types";
import {
    signupService, verifyEmailService, signInService,
    refreshTokenService,
    forgetPasswordService,
    verifyResetOTPService,
    resetPasswordService
} from "../services/auth.services"
import { successResponse } from "../utility/responseHelper";

const signup = async (req: Request<{}, {}, SignupRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { fullname, email, password } = req.body
        const newUser = await signupService(fullname, email, password)
        return res.status(201).json(successResponse("Registration successful! Please check your email for the OTP.", newUser))
    } catch (error: unknown) {
        next(error)
    }
}

const verifyEmail = async (req: Request<{}, {}, VerificationTokensDTO>, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body
        const isEmailVerified = await verifyEmailService(token)
        if (isEmailVerified) {
            return res.status(200).json(successResponse('Email verified successfully.'))
        }
    } catch (error: unknown) {
        next(error)
    }
}


const signIn = async (req: Request<{}, {}, signInRequestDTO>, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body
        const IP = req.ip || "unknown"
        const deviceInfo = req.headers['user-agent'] || "unknown"
        const tokenData = await signInService(email, password, IP, deviceInfo)
        return res.status(200).json(successResponse("Login Successfull", tokenData))
    } catch (error: unknown) {
        next(error)
    }
}

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body
        const token = await refreshTokenService(refreshToken)
        res.status(200).json(successResponse("Token refreshed", token))
    } catch (error: unknown) {
        next(error)
    }
}

const forgotPassword = async (req: Request<{}, {}, ForgotPasswordDTO>, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const updatedEmail = email.toLocaleLowerCase().trim();
        const isForget = await forgetPasswordService(updatedEmail)
        return res.status(200).json(successResponse("If email exists, OTP sent."))
    } catch (error: unknown) {
        next(error)
    }
}



const verifyResetOTP = async (req: Request<{}, {}, VerificationTokensDTO>, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        const verifyOTP = await verifyResetOTPService(token)
        return res.status(200).json(successResponse("OTP is valid"))
    } catch (error: unknown) {
        next(error)
    }
}

const resetPassword = async (req: Request<{}, {}, resetPasswordDTO>, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;
        const verifyOTP = await resetPasswordService(token, newPassword)
        return res.status(200).json(successResponse("Password reset successful"))
    } catch (error: unknown) {
        next(error)
    }
}

export { signup, verifyEmail, signIn, refreshToken, forgotPassword, verifyResetOTP, resetPassword }