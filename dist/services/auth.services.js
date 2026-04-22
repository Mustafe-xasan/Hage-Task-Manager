"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.verifyResetOTPService = exports.forgetPasswordService = exports.refreshTokenService = exports.signInService = exports.verifyEmailService = exports.signupService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const AppError_1 = require("../utility/AppError");
const env_1 = require("../config/env");
const node_crypto_1 = __importDefault(require("node:crypto"));
const email_1 = require("../utility/email");
const tokenGenerator_1 = require("../utility/tokenGenerator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signupService = async (fullname, email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const checkUser = `SELECT userId AS "userId", fullname, email, passwordHash AS "passwordHash", role, isVerified AS "isVerified", createdAt AS "createdAt" FROM users WHERE email = $1`;
    const checkResult = await db_1.default.query(checkUser, [normalizedEmail]);
    if (checkResult.rows.length > 0) {
        throw new AppError_1.AppError("User Already Exist", 400);
    }
    const passwordHash = bcrypt_1.default.hashSync(password, 10);
    const createUser = `INSERT INTO users (fullname, email, passwordHash, role)
    VALUES ($1, $2, $3, $4) RETURNING userId AS "userId"`;
    const userResult = await db_1.default.query(createUser, [fullname, normalizedEmail, passwordHash, "user"]);
    const userRow = userResult.rows[0];
    const userId = userRow.userId;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env_1.env.OTP_EXPIRED_TIME);
    const generatedOTP = Number(node_crypto_1.default.randomInt(100000, 999999));
    const createToken = `INSERT INTO email_verification_tokens (userId, token, expiresAt) 
    VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    await db_1.default.query(createToken, [userId, generatedOTP, expiresAt]);
    try {
        await (0, email_1.sendOTPemail)(generatedOTP, normalizedEmail, "verification");
    }
    catch (error) {
        console.error(`[Signup] Failed to send OTP to ${normalizedEmail}:`, error);
    }
};
exports.signupService = signupService;
const verifyEmailService = async (token) => {
    const checkSql = `SELECT id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt" FROM email_verification_tokens WHERE token = $1 AND 
    expiresAt > NOW()`;
    const tokenResult = await db_1.default.query(checkSql, [token]);
    if (tokenResult.rows.length === 0) {
        throw new AppError_1.AppError("Invalid or expired OTP", 400);
    }
    const tokenRow = tokenResult.rows[0];
    const userId = tokenRow.userId;
    const updateSql = `UPDATE users SET isVerified = TRUE WHERE userId = $1`;
    const userResult = await db_1.default.query(updateSql, [userId]);
    if (userResult.rowCount === 0) {
        throw new AppError_1.AppError("Failed to update user verification", 400);
    }
    const deleteSql = `DELETE FROM email_verification_tokens WHERE token = $1`;
    return await db_1.default.query(deleteSql, [token]);
};
exports.verifyEmailService = verifyEmailService;
const signInService = async (email, password, IP, deviceInfo) => {
    const sql1 = `SELECT userId AS "userId", fullname, email, passwordHash AS "passwordHash", role, isVerified AS "isVerified", createdAt AS "createdAt" FROM users WHERE email = $1`;
    const isUserExist = await db_1.default.query(sql1, [email]);
    if (isUserExist.rows.length === 0) {
        throw new AppError_1.AppError("User is not exist. Register First", 401);
    }
    const user = isUserExist.rows[0];
    if (!user.isVerified) {
        throw new AppError_1.AppError("Email not verified", 401);
    }
    const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        throw new AppError_1.AppError("Password is invalid, Try again", 400);
    }
    // tokens
    const payload = {
        userId: user.userId,
        email: user.email,
        role: user.role
    };
    const accessToken = (0, tokenGenerator_1.generateAccessToken)(payload);
    const refreshToken = (0, tokenGenerator_1.generateRefreshToken)(payload);
    // store tokens
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const sql2 = `INSERT INTO refresh_token (userId, token, expiresAt) VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    const storeToken = await db_1.default.query(sql2, [user.userId, refreshToken, expiresAt]);
    if (storeToken.rowCount === 0) {
        console.log("Token Not Saved");
    }
    const sql3 = `INSERT INTO sessions (userId, deviceInfo, IpAddress) VALUES ($1, $2, $3)`;
    const session = await db_1.default.query(sql3, [user.userId, deviceInfo, IP]);
    if (session.rowCount === 0) {
        console.log("Session is not saved");
    }
    const { passwordHash, ...userWithOutPassword } = user;
    return { accessToken, refreshToken, user: userWithOutPassword };
};
exports.signInService = signInService;
const refreshTokenService = async (oldRefreshToken) => {
    // jwt 
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(oldRefreshToken, env_1.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new AppError_1.AppError("Invalid refresh Token", 401);
    }
    // check if token exist in DB
    const sql1 = `SELECT userId AS "userId" FROM refresh_token WHERE token = $1 AND expiresAt > NOW ()`;
    const isTokenExist = await db_1.default.query(sql1, [oldRefreshToken]);
    if (isTokenExist.rows.length === 0) {
        throw new AppError_1.AppError("Token is not stored in the DB", 401);
    }
    const tokenRow = isTokenExist.rows[0];
    const userIdInDb = tokenRow.userId;
    // tokens
    const payload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
    };
    const newAccessToken = (0, tokenGenerator_1.generateAccessToken)(payload);
    const newRefreshToken = (0, tokenGenerator_1.generateRefreshToken)(payload);
    // Store the new refresh token and delete the old one
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const sql2 = `INSERT INTO refresh_token (userId, token, expiresAt) VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    const newToken = await db_1.default.query(sql2, [decoded.userId, newRefreshToken, expiresAt]);
    if (newToken.rowCount === 0) {
        throw new AppError_1.AppError("New token is not saved", 400);
    }
    const sql3 = `DELETE FROM refresh_token WHERE token = $1`;
    const oldToken = await db_1.default.query(sql3, [oldRefreshToken]);
    if (oldToken.rowCount === 0) {
        throw new AppError_1.AppError("Old Token Is not deleted", 400);
    }
    return {
        accessToken: newAccessToken, refreshToken: newRefreshToken
    };
};
exports.refreshTokenService = refreshTokenService;
const forgetPasswordService = async (email) => {
    const sql = `SELECT userId AS "userId" FROM users WHERE email = $1`;
    const isUserExist = await db_1.default.query(sql, [email]);
    if (isUserExist.rows.length === 0) {
        return;
    }
    const userId = isUserExist.rows[0].userId;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env_1.env.OTP_EXPIRED_TIME);
    const generatedOTP = node_crypto_1.default.randomInt(100000, 999999);
    // store password reset otp
    const sql2 = `INSERT INTO password_reset_token(userId, token, expiresAt) 
    VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    const storeOTP = await db_1.default.query(sql2, [userId, generatedOTP, expiresAt]);
    if (storeOTP.rowCount === 0) {
        throw new AppError_1.AppError("OTP is not stored and An error occured", 400);
    }
    try {
        (0, email_1.sendOTPemail)(generatedOTP, email, "password_reset");
    }
    catch (error) {
        throw new AppError_1.AppError(`An error occured during ${error}`, 500);
    }
};
exports.forgetPasswordService = forgetPasswordService;
const verifyResetOTPService = async (token) => {
    const sql = `SELECT userId AS "userId" FROM password_reset_token WHERE token = $1 AND expiresAt > NOW ()`;
    const result = await db_1.default.query(sql, [token]);
    if (result.rows.length === 0) {
        throw new AppError_1.AppError('Invalid OTP or expired', 400);
    }
    const tokenRow = result.rows[0];
    return {
        userId: tokenRow.userId
    };
};
exports.verifyResetOTPService = verifyResetOTPService;
const resetPasswordService = async (token, newPassword) => {
    const sql1 = `SELECT userId AS "userId" FROM password_reset_token WHERE token = $1 AND expiresAt > NOW ()`;
    const result = await db_1.default.query(sql1, [token]);
    if (result.rows.length === 0) {
        throw new AppError_1.AppError('Invalid OTP or expired', 400);
    }
    const userId = result.rows[0].userId;
    const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
    const sql2 = `UPDATE users SET passwordHash = $1 WHERE userId = $2`;
    const updateUser = await db_1.default.query(sql2, [passwordHash, userId]);
    if (updateUser.rowCount === 0) {
        throw new AppError_1.AppError("Password not updated", 400);
    }
    const sql3 = `DELETE FROM password_reset_token WHERE token = $1`;
    await db_1.default.query(sql3, [token]);
    return true;
};
exports.resetPasswordService = resetPasswordService;
//# sourceMappingURL=auth.services.js.map