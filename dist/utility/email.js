"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPemail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: env_1.env.SMTP_PORT,
    secure: env_1.env.SMTP_PORT == 465,
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS
    }
});
const sendOTPemail = async (otp, to, type) => {
    let subject;
    let text;
    if (type === 'verification') {
        subject = 'Verify Your Email';
        text = `Your verification OTP is: ${otp}. It expires in ${env_1.env.OTP_EXPIRED_TIME} minutes.`;
    }
    else {
        subject = 'Password Reset';
        text = `Your password reset OTP is: ${otp}. It expires in ${env_1.env.OTP_EXPIRED_TIME} minutes.`;
    }
    await transporter.sendMail({
        from: env_1.env.EMAIL_FROM, to, subject, text
    });
};
exports.sendOTPemail = sendOTPemail;
//# sourceMappingURL=email.js.map