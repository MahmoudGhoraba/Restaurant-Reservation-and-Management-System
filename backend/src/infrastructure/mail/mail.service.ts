import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Debug: Check if env variables are loaded
    console.log('Mail Config:', {
      user: process.env.MAIL_USER ? '***@gmail.com' : 'MISSING',
      pass: process.env.MAIL_PASSWORD ? '****' : 'MISSING'
    });

    // Create transporter with your email service configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetOTP(email: string, otp: string, name?: string): Promise<void> {
    const mailOptions = {
      from: `"Restaurant Management" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .otp-box {
              background-color: #fff;
              border: 2px dashed #4CAF50;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              margin: 20px 0;
              color: #4CAF50;
            }
            .warning {
              color: #d32f2f;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello${name ? ' ' + name : ''},</p>
              <p>We received a request to reset your password. Use the OTP code below to reset your password:</p>
              
              <div class="otp-box">
                ${otp}
              </div>
              
              <p><strong>This OTP will expire in 15 minutes.</strong></p>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="warning">
                ⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Restaurant Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello${name ? ' ' + name : ''},
        
        We received a request to reset your password.
        
        Your OTP code is: ${otp}
        
        This OTP will expire in 15 minutes.
        
        If you didn't request a password reset, please ignore this email.
        
        © ${new Date().getFullYear()} Restaurant Management System
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  
}
