import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from "../../data/models/user.schema";
import nodemailer from 'nodemailer';
interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: 'Customer' | 'Admin' | 'Staff';
  profilePicture?: string;
  phone?: string;
  [key: string]: any; //added in case something like adminLevel or postion or shiftTime added for the discriminator 
}

interface RegisterResponse {
  user: IUser;
}

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  user: IUser;
  token: string;
}

interface ForgotPasswordParams {
  email: string;
}

interface ResetPasswordParams {
  email: string;
  otp: string | number;
  newPassword: string;
}

export const registerUser = async (data: RegisterParams): Promise<RegisterResponse> => {
  const { name, email, password, role, profilePicture, phone, ...otherDetails } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    profilePicture,
    phone,
    ...otherDetails //represents other things to add like adminLevel or postion  or shiftTime
  });

  return { user: newUser };
};

export const loginUser = async (data: LoginParams): Promise<LoginResponse> => {
  const { email, password } = data;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('EMAIL_NOT_FOUND');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('INVALID_PASSWORD');
  }
  const secretKey = process.env.JWT_SECRET || 'default_secret_key';

  const token = jwt.sign(
    {
      user: {
        userId: user._id,
        role: user.role
      }
    },
    secretKey,
    { expiresIn: '3h' }
  );

  return { user, token };
};


const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = { from: '"Your App" <no-reply@yourapp.com>', to, subject, text, html };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) reject(error);
      else resolve(info);
    });
  });
};

// forgotPassword
export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("EMAIL_NOT_FOUND");

  const otp = crypto.randomInt(100000, 999999); // 6-digit OTP
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.otp = { temp: otp, expiry };
  await user.save();

  try {
    await sendEmail(
      user.email,
      "Reset Password OTP",
      `Your OTP is ${otp}. It expires in 10 minutes.`,
      `<b>Your OTP is ${otp}. It expires in 10 minutes.</b>`
    );
  } catch (err) {
    console.error(err);
    throw new Error("EMAIL_SEND_FAILED");
  }

  return { message: "OTP sent successfully" };
};

// resetPassword
export const resetPassword = async (email: string, otp: number, newPassword: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("USER_NOT_FOUND");

  if (!user.otp?.temp || !user.otp?.expiry) throw new Error("NO_OTP_REQUESTED");

  if (user.otp.temp !== otp) throw new Error("INVALID_OTP");
  if (user.otp.expiry.getTime() < Date.now()) throw new Error("OTP_EXPIRED");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = { temp: null, expiry: null }; // clear OTP
  await user.save();

  try {
    await sendEmail(
      user.email,
      "Password Changed",
      "Your password was changed successfully.",
      "<b>Your password was changed successfully.</b>"
    );
  } catch (err) {
    console.error("Confirmation email failed:", err);
  }

  return { message: "Password reset successfully" };
};

export const getUserProfile = async (userId: string): Promise<IUser> => {
  const userProfile = await User.findById(userId);

  if (!userProfile) {
    throw new Error('User Profile is not found');
  }
  return userProfile;
};

export const getAllUsers = async (): Promise<IUser[]> => {
  const users = await User.find();

  if (users.length === 0) {
    throw new Error("NO_USERS_FOUND");
  }

  return users;
};


export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};