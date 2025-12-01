import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../middlewares/authMiddleware';
import { AdminGuard } from '../../middlewares/allowAdminMiddleware';
import { RolesGuard } from '../../middlewares/authorizeMiddleware';
import { CreateUserDto, UpdateUserDto, LoginDto } from '../../data/dtos';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() data: CreateUserDto): Promise<any> {
    try {
      const user = await this.userService.registerUser(data);
      return {
        success: true,
        message: 'User registered successfully',
        data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Registration failed' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    try {
      const result = await this.userService.loginUser(data);
      return {
        success: true,
        message: 'Login successful',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Login failed' },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      const result = await this.userService.forgotPassword(email);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to send reset email' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string
  ) {
    try {
      const result = await this.userService.resetPassword(email, otp, newPassword);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Password reset failed' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      const user = await this.userService.getUserProfile(req.user.id);
      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to get profile' },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers();
      return {
        success: true,
        data: { users }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to get users' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(id);
      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'User not found' },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    try {
      const user = await this.userService.updateUser(id, data);
      return {
        success: true,
        message: 'User updated successfully',
        data: { user }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to update user' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to delete user' },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}