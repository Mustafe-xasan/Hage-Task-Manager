import {AttemptTimeEntity, UserEntity, CountResult} from '../types/auth.types'
import pool from '../config/db'
 // Helper: count recent failed attempts (last 15 minutes)
    export const countRecentFailedAttempts = async (userId: number): Promise<number> => {
        const result = await pool.query(
            `SELECT COUNT(*) FROM login_attempts 
             WHERE userId = $1 AND attemptTime > NOW() - INTERVAL '15 minutes'`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    };

    // Helper: record a failed attempt
   export  const recordFailedAttempt = async (userId: number, ipAddress: string) => {
        await pool.query(
            `INSERT INTO login_attempts (userId, ip) VALUES ($1, $2)`,
            [userId, ipAddress]
        );
    };

    // Helper: clear all failed attempts for a user (on success)
    export const clearFailedAttempts = async (userId: number) => {
        await pool.query(`DELETE FROM login_attempts WHERE userId = $1`, [userId]);
    };

    // Helper: lock account for 15 minutes
    export const lockAccount = async (userId: number) => {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 15);
        await pool.query(
            `UPDATE users SET lockedUntil = $1 WHERE userId = $2`,
            [lockedUntil, userId]
        );
    };