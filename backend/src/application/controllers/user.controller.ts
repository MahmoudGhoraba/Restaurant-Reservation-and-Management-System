import { Request, Response } from 'express';
import * as userService from '../services/user.service';

interface RegisterRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: 'Customer' | 'Admin' | 'Staff';
  profilePicture?: string;
  phone?:string;
  adminLevel?: string;
  position?: string;
  shiftTime?: string;
}


interface LoginRequest {
  email?: string;
  password?: string;
}

interface ForgotPasswordRequest {
  email?: string;
}

interface ResetPasswordRequest {
  email?: string;
  otp?: string | number;
  password?: string; 
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, profilePicture,phone,...otherDetails } = req.body as RegisterRequest;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const { user } = await userService.registerUser({
      name,
      email,
      password,
      role,
      profilePicture,
      phone,
      ...otherDetails
    });

    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error("Error registering user:", error);

    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({ message: 'Email already registered please use another email' });
    }

    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const { user, token } = await userService.loginUser({ email, password });

    const expiresAt = new Date(Date.now() + 1800000); 

    return res
      .cookie("token", token, {
        expires: expiresAt,
        httpOnly: true,
        //secure: process.env.NODE_ENV === 'production',   //in deployment
        secure: true,//in development
        sameSite: "none",
      })
      .status(200)
      .json({ 
        message: "Login successful", 
        user: {
           _id: user._id,
           name: user.name,
           email: user.email,
           role: user.role
        }, 
        token 
      });

  } catch (error: any) {
    console.error("Error logging in:", error);

    if (error.message === 'EMAIL_NOT_FOUND') {
      return res.status(404).json({ message: "Email not found" });
    }
    
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({ message: "Incorrect password" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordRequest;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await userService.forgotPassword({ email });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Forgot Password Error:", error);

    if (error.message === 'EMAIL_NOT_FOUND') {
      return res.status(404).json({ message: "User not found" });
    }
    if (error.message === 'EMAIL_SEND_FAILED') {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const authOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body as ResetPasswordRequest;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and new Password are required" });
    }

    const result = await userService.resetPassword({ 
      email, 
      otp, 
      newPassword: password 
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Auth OTP Error:", error);

    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: "User not found" });
    if (error.message === 'NO_OTP_REQUESTED') return res.status(400).json({ message: "No OTP request found for this user" });
    if (error.message === 'INVALID_OTP') return res.status(400).json({ message: "Invalid OTP provided" });
    if (error.message === 'OTP_EXPIRED') return res.status(400).json({ message: "OTP has expired" });

    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req:Request,res:Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const userProfile = await userService.getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'No profile is found' });
    }

    return res.status(200).json({ user: userProfile });
  } catch (error: any) {
    console.error("Get User Profile Error:", error);
    return res.status(500).json({ message: error?.message || 'Server error' });
  }
}