import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { IUser } from '../models/user.schema';
import {
  RegisterDto,
  LoginDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto';
import { MailService } from '../infrastructure/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: any; token: string }> {
    const { name, email, password, phone, role = 'Customer' } = registerDto;

    // Validate role
    const validRoles = ['Customer', 'Admin', 'Staff'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role. Must be Customer, Admin, or Staff');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const userObject = user.toObject();
    const { password: pwd, ...userWithoutPassword } = userObject;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Find user by email (case insensitive)
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const userObject = user.toObject();
    const { password: userPassword, ...userWithoutPassword } = userObject;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; otp?: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    
    // For security, don't reveal if user exists
    // But in development, we'll return the OTP for testing
    if (!user) {
      return {
        message: 'If the email exists, a password reset code has been sent',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to user
    await this.userModel.findByIdAndUpdate(user._id, {
      resetPasswordOtp: otp,
      resetPasswordExpiry: otpExpiry,
    });

    // Send OTP via email
    try {
      await this.mailService.sendPasswordResetOTP(user.email, otp, user.name);
      console.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // In development, still return OTP if email fails
      if (process.env.NODE_ENV === 'development') {
        return {
          message: 'Password reset code has been sent to your email',
          otp, // Return OTP in development if email fails
        };
      }
      throw new BadRequestException('Failed to send password reset email. Please try again.');
    }

    return {
      message: 'Password reset code has been sent to your email',
      // Only return OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetDto;

    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Email, OTP, and new password are required');
    }

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify OTP
    if (user.resetPasswordOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordOtp: null,
      resetPasswordExpiry: null,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateDto, { new: true })
      .select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });

    return {
      message: 'Password changed successfully',
    };
  }

  async logout(): Promise<{ message: string }> {
    // For JWT, logout is typically handled client-side by removing the token
    // But we can implement token blacklisting if needed
    return {
      message: 'Logged out successfully',
    };
  }
}
