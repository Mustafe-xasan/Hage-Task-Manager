import bcrypt from "bcrypt";
import pool from "../config/db";
import { AppError } from "../utility/AppError";
import { env } from "../config/env"
import crypto from "node:crypto"
import { sendOTPemail } from "../utility/email";
import {
    UserEntity,
    EmailVerificationTokensEntity,
    passwordResetTokenEntity,
    SessionEntity,
    RefreshTokenEntity,
    SignupRequestDTO,
    VerificationTokensDTO,
    signInRequestDTO,
    tokenPayloadDTO,
    ForgotPasswordDTO
} from "../types/auth.types";
import {clearFailedAttempts, countRecentFailedAttempts, lockAccount, recordFailedAttempt} from "../utility/loginAttemptHelpers"
import { generateAccessToken, generateRefreshToken } from "../utility/tokenGenerator";
import jwt from "jsonwebtoken"





const signupService = async (fullname: string, email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const checkUser = `SELECT userId AS "userId", fullname, email, passwordHash AS "passwordHash", role, isVerified AS "isVerified", createdAt AS "createdAt" FROM users WHERE email = $1`
    const checkResult = await pool.query<UserEntity>(checkUser, [normalizedEmail])
    if (checkResult.rows.length > 0) {
        throw new AppError("User Already Exist", 400)
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const createUser = `INSERT INTO users (fullname, email, passwordHash, role)
    VALUES ($1, $2, $3, $4) RETURNING userId AS "userId"`
    const userResult = await pool.query<UserEntity>(createUser, [fullname, normalizedEmail, passwordHash, "user"])
    const userRow = userResult.rows[0];
    const userId = userRow.userId;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRED_TIME)
    const generatedOTP: number = Number(crypto.randomInt(100000, 999999))

    const createToken = `INSERT INTO email_verification_tokens (userId, token, expiresAt) 
    VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`

    await pool.query<EmailVerificationTokensEntity>(createToken, [userId, generatedOTP, expiresAt])

    try {
        await sendOTPemail(generatedOTP, normalizedEmail, "verification")
    } catch (error) {
        console.error(`[Signup] Failed to send OTP to ${normalizedEmail}:`, error)
    }
}


const verifyEmailService = async (token: string) => {
    const checkSql = `SELECT id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt" FROM email_verification_tokens WHERE token = $1 AND 
    expiresAt > NOW()`
    const tokenResult = await pool.query<EmailVerificationTokensEntity>(checkSql, [token])

    if (tokenResult.rows.length === 0) {
        throw new AppError("Invalid or expired OTP", 400)
    }

    const tokenRow = tokenResult.rows[0];
    const userId = tokenRow.userId;
    const updateSql = `UPDATE users SET isVerified = TRUE WHERE userId = $1`
    const userResult = await pool.query<UserEntity>(updateSql, [userId])

    if (userResult.rowCount === 0) {
        throw new AppError("Failed to update user verification", 400)
    }

    const deleteSql = `DELETE FROM email_verification_tokens WHERE token = $1`
    return await pool.query<EmailVerificationTokensEntity>(deleteSql, [token])
}

const signInService = async (email: string, password: string, IP: string, deviceInfo: string) => {


    // 1. Check if user exists
    const sql1 = `SELECT userId AS "userId", fullname, email, passwordHash AS "passwordHash", role, isVerified AS "isVerified", createdAt AS "createdAt", lockedUntil AS "lockedUntil" FROM users WHERE email = $1`;
    const isUserExist = await pool.query<UserEntity>(sql1, [email]);
    if (isUserExist.rows.length === 0) {
        throw new AppError("User does not exist. Register first.", 401);
    }

    const user: UserEntity = isUserExist.rows[0];

    // 2. Check email verification
    if (!user.isVerified) {
        throw new AppError("Email not verified. Please verify your email.", 401);
    }

    // 3. Check if account is currently locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const lockedUntil = new Date(user.lockedUntil).toLocaleTimeString();
        throw new AppError(`Account is locked until ${lockedUntil}.`, 403);
    }

    // 4. Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        // Record failed attempt
        await recordFailedAttempt(user.userId, IP);

        // Count recent failures
        const failedCount = await countRecentFailedAttempts(user.userId);
        const maxAttempts = 5;
        const remainingAttempts = maxAttempts - failedCount;

        if (failedCount >= maxAttempts) {
            await lockAccount(user.userId);
            throw new AppError("Too many failed attempts. Account locked for 15 minutes.", 403);
        }

        throw new AppError(`Invalid password. ${remainingAttempts} attempt(s) remaining before lock.`, 401);
    }

    // 5. Successful login – clear failures and unlock
    await clearFailedAttempts(user.userId);
    await pool.query(`UPDATE users SET lockedUntil = NULL WHERE userId = $1`, [user.userId]);

    // 6. Generate tokens
    const payload: tokenPayloadDTO = {
        userId: user.userId,
        email: user.email,
        role: user.role
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 7. Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const sql2 = `INSERT INTO refresh_token (userId, token, expiresAt) VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    const storeToken = await pool.query<RefreshTokenEntity>(sql2, [user.userId, refreshToken, expiresAt]);
    if (storeToken.rowCount === 0) {
        console.log("Token not saved");
    }

    // 8. Log session
    const sql3 = `INSERT INTO sessions (userId, deviceInfo, IpAddress) VALUES ($1, $2, $3)`;
    const session = await pool.query<SessionEntity>(sql3, [user.userId, deviceInfo, IP]);
    if (session.rowCount === 0) {
        console.log("Session not saved");
    }

    // 9. Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
};


const refreshTokenService = async (oldRefreshToken: string) => {
    // jwt 
    let decoded: tokenPayloadDTO;
    try {

        decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload as tokenPayloadDTO
    } catch (error: unknown) {
        throw new AppError("Invalid refresh Token", 401)
    }
    // check if token exist in DB
    const sql1 = `SELECT userId AS "userId" FROM refresh_token WHERE token = $1 AND expiresAt > NOW ()`;
    const isTokenExist = await pool.query<RefreshTokenEntity>(sql1, [oldRefreshToken])
    if (isTokenExist.rows.length === 0) {
        throw new AppError("Token is not stored in the DB", 401)
    }
    const tokenRow = isTokenExist.rows[0];
    const userIdInDb = tokenRow.userId;

    // tokens
    const payload: tokenPayloadDTO = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
    }
    const newAccessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    // Store the new refresh token and delete the old one
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7)

    const sql2 = `INSERT INTO refresh_token (userId, token, expiresAt) VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`;
    const newToken = await pool.query<RefreshTokenEntity>(sql2, [decoded.userId, newRefreshToken, expiresAt])

    if (newToken.rowCount === 0) {
        throw new AppError("New token is not saved", 400)
    }

    const sql3 = `DELETE FROM refresh_token WHERE token = $1`
    const oldToken = await pool.query<RefreshTokenEntity>(sql3, [oldRefreshToken])
    if (oldToken.rowCount === 0) {
        throw new AppError("Old Token Is not deleted", 400)
    }

    return {
        accessToken: newAccessToken, refreshToken: newRefreshToken
    }

}

const forgetPasswordService = async (email: string) => {
    const sql = `SELECT userId AS "userId" FROM users WHERE email = $1`;
    const isUserExist = await pool.query<UserEntity>(sql, [email])
    if (isUserExist.rows.length === 0) {
        return;
    }
    const userId = isUserExist.rows[0].userId;

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRED_TIME)
    const generatedOTP: number = crypto.randomInt(100000, 999999)
    // store password reset otp
    const sql2 = `INSERT INTO password_reset_token(userId, token, expiresAt) 
    VALUES ($1, $2, $3) RETURNING id, userId AS "userId", token, expiresAt AS "expiresAt", createdAt AS "createdAt"`
    const storeOTP = await pool.query<passwordResetTokenEntity>(sql2, [userId, generatedOTP, expiresAt])
    if (storeOTP.rowCount === 0) {
        throw new AppError("OTP is not stored and An error occured", 400)
    }

    try {
        sendOTPemail(generatedOTP, email, "password_reset")
    } catch (error: unknown) {
        throw new AppError(`An error occured during ${error}`, 500)
    }
}

const verifyResetOTPService = async (token: string) => {
    const sql = `SELECT userId AS "userId" FROM password_reset_token WHERE token = $1 AND expiresAt > NOW ()`
    const result = await pool.query<passwordResetTokenEntity>(sql, [token])
    if (result.rows.length === 0) {
        throw new AppError('Invalid OTP or expired', 400)
    }

    const tokenRow = result.rows[0]
    return {
        userId: tokenRow.userId
    }
}

const resetPasswordService = async (token: string, newPassword: string) => {
    const sql1 = `SELECT userId AS "userId" FROM password_reset_token WHERE token = $1 AND expiresAt > NOW ()`
    const result = await pool.query<passwordResetTokenEntity>(sql1, [token])
    if (result.rows.length === 0) {
        throw new AppError('Invalid OTP or expired', 400)
    }

    const userId = result.rows[0].userId
    const passwordHash = await bcrypt.hash(newPassword, 10)

    const sql2 = `UPDATE users SET passwordHash = $1 WHERE userId = $2`
    const updateUser = await pool.query<UserEntity>(sql2, [passwordHash, userId])
    if (updateUser.rowCount === 0) {
        throw new AppError("Password not updated", 400)
    }

    const sql3 = `DELETE FROM password_reset_token WHERE token = $1`
    await pool.query<passwordResetTokenEntity>(sql3, [token])
    return true


}
export { signupService, verifyEmailService, signInService, refreshTokenService, forgetPasswordService, verifyResetOTPService, resetPasswordService }