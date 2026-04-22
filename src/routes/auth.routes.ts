import { Router } from "express"
import { signUpValidation, signInValidation, otpValidation, refreshTokenSchema, forgotPasswordValidation, resetPasswordValidation } from "../validation/authValidation"
import { signup, verifyEmail, signIn, refreshToken, forgotPassword, verifyResetOTP, resetPassword } from "../controllers/auth.controller"
import { validate } from "../middlewares/validateMiddleware.task"

const authRoutes = Router()
authRoutes.post("/signup", validate(signUpValidation, "body"), signup)
authRoutes.post("/verify_email", validate(otpValidation, "body"), verifyEmail)
authRoutes.post("/signin", validate(signInValidation, "body"), signIn)
authRoutes.post("/refresh_token", validate(refreshTokenSchema, "body"), refreshToken)
authRoutes.post("/forget_password", validate(forgotPasswordValidation, "body"), forgotPassword)
authRoutes.post("/verify-reset-otp", validate(otpValidation, "body"), verifyResetOTP);
authRoutes.post("/reset-password", validate(resetPasswordValidation, "body"), resetPassword);


export default authRoutes