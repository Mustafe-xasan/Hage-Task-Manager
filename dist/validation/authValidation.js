"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.refreshTokenSchema = exports.otpValidation = exports.signInValidation = exports.signUpValidation = void 0;
const zod_1 = require("zod");
const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const signUpValidation = zod_1.z.object({
    fullname: zod_1.z.string()
        .max(100, "Full name must be at maximum 100 characters")
        .min(3, "Full name must be at least 3 characters"),
    email: zod_1.z.string().regex(emailRegex, "Invalid email format"),
    password: zod_1.z.string().regex(passwordRegex, "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number"),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password is not match",
    path: ["confirmPassword"]
});
exports.signUpValidation = signUpValidation;
const signInValidation = zod_1.z.object({
    email: zod_1.z.string().regex(emailRegex, "Invalid email format"),
    password: zod_1.z.string().regex(passwordRegex, "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number")
});
exports.signInValidation = signInValidation;
const otpValidation = zod_1.z.object({
    token: zod_1.z.string().min(6, "OTP must be minimum 6 digit")
        .max(6, "OTP must be maximum 6 digit")
});
exports.otpValidation = otpValidation;
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z
        .string()
        .min(1, "Token cannot be empty")
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, "Invalid token format")
});
exports.refreshTokenSchema = refreshTokenSchema;
const forgotPasswordValidation = zod_1.z.object({
    email: zod_1.z.string().regex(emailRegex, "Invalid email format")
});
exports.forgotPasswordValidation = forgotPasswordValidation;
const resetPasswordValidation = zod_1.z.object({
    token: zod_1.z.string().min(6, "OTP must be minimum 6 digit")
        .max(6, "OTP must be maximum 6 digit"),
    newPassword: zod_1.z.string().regex(passwordRegex, "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number")
});
exports.resetPasswordValidation = resetPasswordValidation;
//# sourceMappingURL=authValidation.js.map