import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Application Root Controller
 *
 * Handles basic health checks and metadata endpoints
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * Used by Docker healthcheck and monitoring systems
   */
  @Get('health')
  health(): { status: string; timestamp: string } {
    return this.appService.health();
  }

  /**
   * API metadata endpoint
   * Returns version and service information
   */
  @Get('info')
  info(): {
    name: string;
    version: string;
    environment: string;
    timestamp: string;
  } {
    return this.appService.info();
  }
}
