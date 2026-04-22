import { z } from "zod"

const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const signUpValidation = z.object({
    fullname: z.string()
        .max(100, "Full name must be at maximum 100 characters")
        .min(3, "Full name must be at least 3 characters"),
    email: z.string().regex(emailRegex,
        "Invalid email format"
    ),
    password: z.string().regex(passwordRegex,
        "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number"
    ),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password is not match",
    path: ["confirmPassword"]
});

const signInValidation = z.object({
    email: z.string().regex(emailRegex, "Invalid email format"),
    password: z.string().regex(passwordRegex, "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number")
})

const otpValidation = z.object({
    token: z.string().min(6, "OTP must be minimum 6 digit")
        .max(6, "OTP must be maximum 6 digit")
})

const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Token cannot be empty")
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, "Invalid token format")
});

const forgotPasswordValidation = z.object({
    email: z.string().regex(emailRegex, "Invalid email format")
})

const resetPasswordValidation = z.object({
    token: z.string().min(6, "OTP must be minimum 6 digit")
        .max(6, "OTP must be maximum 6 digit"),
    newPassword: z.string().regex(passwordRegex, "Password must be at least 6 characters, contain one uppercase, one lowercase, and one number")
})

export { signUpValidation, signInValidation, otpValidation, refreshTokenSchema, forgotPasswordValidation, resetPasswordValidation }
