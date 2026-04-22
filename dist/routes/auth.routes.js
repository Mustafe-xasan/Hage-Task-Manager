"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authValidation_1 = require("../validation/authValidation");
const auth_controller_1 = require("../controllers/auth.controller");
const validateMiddleware_task_1 = require("../middlewares/validateMiddleware.task");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/signup", (0, validateMiddleware_task_1.validate)(authValidation_1.signUpValidation, "body"), auth_controller_1.signup);
authRoutes.post("/verify_email", (0, validateMiddleware_task_1.validate)(authValidation_1.otpValidation, "body"), auth_controller_1.verifyEmail);
authRoutes.post("/signin", (0, validateMiddleware_task_1.validate)(authValidation_1.signInValidation, "body"), auth_controller_1.signIn);
authRoutes.post("/refresh_token", (0, validateMiddleware_task_1.validate)(authValidation_1.refreshTokenSchema, "body"), auth_controller_1.refreshToken);
authRoutes.post("/forget_password", (0, validateMiddleware_task_1.validate)(authValidation_1.forgotPasswordValidation, "body"), auth_controller_1.forgotPassword);
authRoutes.post("/verify-reset-otp", (0, validateMiddleware_task_1.validate)(authValidation_1.otpValidation, "body"), auth_controller_1.verifyResetOTP);
authRoutes.post("/reset-password", (0, validateMiddleware_task_1.validate)(authValidation_1.resetPasswordValidation, "body"), auth_controller_1.resetPassword);
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map