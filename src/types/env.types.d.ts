declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        DB_USER: string;
        DB_NAME: string;
        DB_PASSWORD: string;
        DB_HOST: string;
        DB_PORT: string;

        OTP_EXPIRED_TIME: string;

        // All Nodemailer related variables
        EMAIL_FROM: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_USER: string;
        SMTP_PASS: string;

        // All  Token related variables
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
        JWT_ACCESS_EXPIRE_IN: string;
        JWT_REFRESH_EXPIRE_IN: string;
    }
}