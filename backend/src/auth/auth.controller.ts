import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication Controller
 *
 * Endpoints for user registration and login
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new company and admin user
   *
   * @param registerDto - Company and user registration data
   * @returns User profile and JWT tokens
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new company' })
  @ApiResponse({
    status: 201,
    description: 'Company and user successfully registered',
  })
  @ApiResponse({ status: 409, description: 'Company or user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * User login
   *
   * @param loginDto - Email/phone and password
   * @returns User profile and JWT tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with email or phone' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Placeholder for refresh token endpoint
   * Will be implemented with Redis token blacklist
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refreshToken() {
    // Implementation in next phase
    return { message: 'Refresh endpoint - coming soon' };
  }

  /**
   * Placeholder for logout endpoint
   * Will revoke refresh token in Redis
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout() {
    // Implementation in next phase
    return { message: 'Logout endpoint - coming soon' };
  }
}
