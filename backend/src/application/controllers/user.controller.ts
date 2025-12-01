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
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const { name, email, password, role, profilePicture, phone, adminLevel, ...otherDetails } = req.body as RegisterRequest;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
     if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }
     if (!password) {
      return res.status(400).json({ message: 'password is required' });
    }
     if (!role) {
      return res.status(400).json({ message: 'role is required' });
    }

    if (role === 'Admin' && !adminLevel) {
      return res.status(400).json({ 
        message: 'Admin level is required for Admin role. Please specify either "Manager Admin" or "Main Admin"' 
      });
    }

    if (role === 'Admin' && adminLevel && !['Manager Admin', 'Main Admin'].includes(adminLevel)) {
      return res.status(400).json({ 
        message: 'Invalid admin level. Must be either "Manager Admin" or "Main Admin"' 
      });
    }

    const { user } = await userService.registerUser({
      name,
      email,
      password,
      role,
      profilePicture,
      phone,
      adminLevel,
      ...otherDetails
    });

    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(role === 'Admin' && { adminLevel })
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

    // Build user response object
    const userResponse: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Add adminLevel if user is Admin
    if (user.role === 'Admin' && (user as any).adminLevel) {
      userResponse.adminLevel = (user as any).adminLevel;
    }

    return res
    .cookie("token", token, {
      expires: expiresAt,
      httpOnly: true,
      secure: false,   // <--- false for localhost
      sameSite: "lax", // <--- 'lax' works on localhost
    })
    .status(200)
    .json({ 
      message: "Login successful", 
      user: userResponse, 
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
    if(userProfile.role=="Admin"){
      const adminProfile = await userService.getUserProfile(userId);
    }
    return res.status(200).json({ user: userProfile });
  } catch (error: any) {
    console.error("Get User Profile Error:", error);
    return res.status(500).json({ message: error?.message || 'Server error' });
  }
}

export const getUsers = async (req:Request, res:Response) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error:any) {
    console.error("Get Users Error:", error);

    if (error.message === "NO_USERS_FOUND") {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const user = await userService.getUserById(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Get User By ID Error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(500).json({ message: "Server error" });
  }
};