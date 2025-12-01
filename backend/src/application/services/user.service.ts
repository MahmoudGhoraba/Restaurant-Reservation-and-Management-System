import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User, UserDocument } from '../../data/models/user.schema';
import { Admin, AdminDocument } from '../../data/models/admin.schema';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto } from '../../data/dtos';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async registerUser(data: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new this.userModel({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
    });

    return newUser.save();
  }

  async loginUser(data: LoginDto): Promise<{ user: UserDocument; token: string }> {
    let user = await this.userModel.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw new Error('EMAIL_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('INVALID_PASSWORD');
    }

    // If user is Admin, get the full admin document with adminLevel
    if (user.role === 'Admin') {
      const adminUser = await this.adminModel.findById(user._id).select('+password');
      if (adminUser) {
        user = adminUser;
      }
    }

    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    const token = jwt.sign(
      {
        user: {
          id: user._id,
          userId: user._id,
          role: user.role,
          email: user.email,
          ...(user.role === 'Admin' && { adminLevel: (user as any).adminLevel })
        }
      },
      secretKey,
      { expiresIn: '3h' }
    );

    return { user, token };
  }



  private async sendEmail(to: string, subject: string, text: string, html: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_CREDENTIALS_MISSING");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    // verify SMTP/auth configuration before attempting to send
    await transporter.verify();
  } catch (verifyErr) {
    console.error("SMTP verification failed:", verifyErr);
    throw new Error("EMAIL_SMTP_VERIFICATION_FAILED");
  }

  const mailOptions = {
    from: `"Your App" <${user}>`,
    to,
    subject,
    text,
    html,
  };

    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (sendErr) {
      console.error("sendMail error:", sendErr);
      throw sendErr;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('EMAIL_NOT_FOUND');
    }

    const otpPass = crypto.randomInt(10000000, 99999999);
    const endDate = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    user.otp = {
      temp: otpPass,
      expiry: endDate
    };

    await user.save();

    try {
      await this.sendEmail(
        user.email,
        "Reset Password OTP",
        `The OTP is: ${otpPass}, expires at: ${endDate}`,
        `<b>The OTP is: ${otpPass}, expires at: ${endDate}</b>`
      );
    } catch (error) {
      console.error("Forgot Password - email send failed:", error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { message: `OTP sent to ${email}` };
  }

  async resetPassword(email: string, otp: string | number, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.otp || !user.otp.temp || !user.otp.expiry) {
      throw new Error('NO_OTP_REQUESTED');
    }

    if (Number(otp) !== user.otp.temp) {
      throw new Error('INVALID_OTP');
    }

    if (user.otp.expiry.getTime() <= Date.now()) {
      throw new Error('OTP_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = { temp: null, expiry: null };
    await user.save();

    try {
      await this.sendEmail(
        user.email,
        "Password Changed Successfully",
        `Your password has been changed.`,
        `<b>Your password has been changed successfully.</b>`
      );
    } catch (error) {
      console.error("Confirmation email failed to send");
    }

    return { message: "Password changed successfully" };
  }


  async getUserProfile(userId: string): Promise<UserDocument> {
    const userProfile = await this.userModel.findById(userId);
    if (!userProfile) {
      throw new Error('USER_NOT_FOUND');
    }
    return userProfile;
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find();
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return user;
  }

  async updateUser(userId: string, updateData: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
  }
}