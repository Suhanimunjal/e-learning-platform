import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
        to: email,
        subject: 'Your Teacher Account OTP - E-Learning Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">E-Learning Platform</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-top: 0;">Verify Your Teacher Account</h2>
              <p style="color: #6b7280; font-size: 16px;">
                Your One-Time Password (OTP) is:
              </p>
              <div style="background: #e5e7eb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                This OTP will expire in 10 minutes.
              </p>
              <p style="color: #dc2626; font-size: 12px; margin-top: 20px;">
                If you didn't request this OTP, please ignore this email.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendLoginOTP(email: string, name: string, otp: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
        to: email,
        subject: 'Login OTP - E-Learning Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">E-Learning Platform</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-top: 0;">Login Verification</h2>
              <p style="color: #6b7280; font-size: 16px;">
                Hello ${name},
              </p>
              <p style="color: #6b7280; font-size: 16px;">
                Your One-Time Password (OTP) for login is:
              </p>
              <div style="background: #e5e7eb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                This OTP will expire in 5 minutes.
              </p>
              <p style="color: #dc2626; font-size: 12px; margin-top: 20px;">
                If you didn't attempt to login, please ignore this email or contact support immediately.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send login OTP email:', error);
      return false;
    }
  }

  async sendTeacherApproved(email: string, name: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
        to: email,
        subject: 'Teacher Account Approved - E-Learning Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Congratulations ${name}!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="color: #1f2937; font-size: 16px;">
                Your teacher account has been approved by the administrator.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                You can now log in and start creating courses.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send approval email:', error);
      return false;
    }
  }

  async sendTeacherRejected(email: string, name: string, reason?: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
        to: email,
        subject: 'Teacher Account Rejected - E-Learning Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #DC2626, #991B1B); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Application Rejected</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="color: #1f2937; font-size: 16px;">
                Hello ${name},
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                ${reason || 'Your teacher account application has been rejected by the administrator.'}
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                If you believe this is a mistake, please contact support.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      return false;
    }
  }

  async sendEnrollmentApproved(studentEmail: string, studentName: string, courseTitle: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'E-Learning Platform <noreply@elearning.com>',
        to: studentEmail,
        subject: `Enrollment Approved - ${courseTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Enrollment Approved!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="color: #1f2937; font-size: 16px;">
                Hello ${studentName},
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Your enrollment in <strong>${courseTitle}</strong> has been approved. You can now access all course materials.
              </p>
            </div>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send enrollment approved email:', error);
      return false;
    }
  }
}
