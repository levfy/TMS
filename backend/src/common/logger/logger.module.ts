import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 * Provides centralized logging across the application
 */
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
