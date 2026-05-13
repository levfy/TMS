import { Injectable } from '@nestjs/common';

/**
 * Application Service
 *
 * Provides core application logic and utilities
 */
@Injectable()
export class AppService {
  /**
   * Health check response
   * @returns Health status and timestamp
   */
  health(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * API information response
   * @returns Service metadata
   */
  info(): {
    name: string;
    version: string;
    environment: string;
    timestamp: string;
  } {
    return {
      name: 'KazDispatch TMS API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
