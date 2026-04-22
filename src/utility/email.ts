import nodemailer from "nodemailer";
import { env } from "../config/env"

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT == 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})

export const sendOTPemail = async (otp: number, to: string, type: 'verification' | 'password_reset') => {
  let subject: string;
  let text: string;
  if (type === 'verification') {
    subject = 'Verify Your Email';
    text = `Your verification OTP is: ${otp}. It expires in ${env.OTP_EXPIRED_TIME} minutes.`;
  } else {
    subject = 'Password Reset';
    text = `Your password reset OTP is: ${otp}. It expires in ${env.OTP_EXPIRED_TIME} minutes.`;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM, to, subject, text
  })
}