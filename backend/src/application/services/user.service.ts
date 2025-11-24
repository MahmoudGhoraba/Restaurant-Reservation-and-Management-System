import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from "../../data/models/user.schema";
import nodemailer from 'nodemailer';
interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: 'Customer' | 'Admin' | 'Staff';
  profilePicture?:string;
  phone?:string;
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
  const { name, email, password, role,profilePicture,phone,...otherDetails } = data;

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

  return {user:newUser};
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

export const forgotPassword = async (data: ForgotPasswordParams): Promise<{ message: string }> => {
  const { email } = data;

  const user = await User.findOne({ email });
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
    await sendEmail(
      user.email,
      "Reset Password OTP",
      `The OTP is: ${otpPass}, expires at: ${endDate}`,
      `<b>The OTP is: ${otpPass}, expires at: ${endDate}</b>`
    );
  } catch (error) {
    throw new Error('EMAIL_SEND_FAILED');
  }

  return { message: `OTP sent to ${email}` };
};

export const resetPassword = async (data: ResetPasswordParams): Promise<{ message: string }> => {
  const { email, otp, newPassword } = data;

  const user = await User.findOne({ email });
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
    await sendEmail(
      user.email,
      "Password Changed Successfully",
      `Your password has been changed.`,
      `<b>Your password has been changed successfully.</b>`
    );
  } catch (error) {
    console.error("Confirmation email failed to send");
  }

  return { message: "Password changed successfully" };
};


export const getUserProfile = async (userId: string): Promise<IUser> => {
  const userProfile = await User.findById({ userId });
  
  if (!userProfile) {
    throw new Error('User Profile is not found');
  }
  return userProfile;
};

