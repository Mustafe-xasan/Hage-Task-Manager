"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetOTP = exports.forgotPassword = exports.refreshToken = exports.signIn = exports.verifyEmail = exports.signup = void 0;
const auth_services_1 = require("../services/auth.services");
const responseHelper_1 = require("../utility/responseHelper");
const signup = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;
        const newUser = await (0, auth_services_1.signupService)(fullname, email, password);
        return res.status(201).json((0, responseHelper_1.successResponse)("Registration successful! Please check your email for the OTP.", newUser));
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        const isEmailVerified = await (0, auth_services_1.verifyEmailService)(token);
        if (isEmailVerified) {
            return res.status(200).json((0, responseHelper_1.successResponse)('Email verified successfully.'));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const IP = req.ip || "unknown";
        const deviceInfo = req.headers['user-agent'] || "unknown";
        const tokenData = await (0, auth_services_1.signInService)(email, password, IP, deviceInfo);
        return res.status(200).json((0, responseHelper_1.successResponse)("Login Successfull", tokenData));
    }
    catch (error) {
        next(error);
    }
};
exports.signIn = signIn;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const token = await (0, auth_services_1.refreshTokenService)(refreshToken);
        res.status(200).json((0, responseHelper_1.successResponse)("Token refreshed", token));
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const updatedEmail = email.toLocaleLowerCase().trim();
        const isForget = await (0, auth_services_1.forgetPasswordService)(updatedEmail);
        return res.status(200).json((0, responseHelper_1.successResponse)("If email exists, OTP sent."));
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const verifyResetOTP = async (req, res, next) => {
    try {
        const { token } = req.body;
        const verifyOTP = await (0, auth_services_1.verifyResetOTPService)(token);
        return res.status(200).json((0, responseHelper_1.successResponse)("OTP is valid"));
    }
    catch (error) {
        next(error);
    }
};
exports.verifyResetOTP = verifyResetOTP;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const verifyOTP = await (0, auth_services_1.resetPasswordService)(token, newPassword);
        return res.status(200).json((0, responseHelper_1.successResponse)("Password reset successful"));
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map