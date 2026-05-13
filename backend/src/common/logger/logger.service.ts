import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

/**
 * Logger Service
 *
 * Centralized logging using Winston
 * Logs to console and file with rotation
 * Different levels: error, warn, info, debug
 */
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'kazdispatch-api' },
      transports: [
        // Console output
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, data }) => {
                const prefix = context ? `[${context}]` : '';
                const meta = data ? ` ${JSON.stringify(data)}` : '';
                return `${timestamp} [${level}] ${prefix} ${message}${meta}`;
              },
            ),
          ),
        }),

        // Error file
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Combined file
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),
      ],
    });
  }

  /**
   * Log error level message
   */
  error(message: string, context?: string, data?: any) {
    this.logger.error(message, { context, data });
  }

  /**
   * Log warn level message
   */
  warn(message: string, context?: string, data?: any) {
    this.logger.warn(message, { context, data });
  }

  /**
   * Log info level message
   */
  log(message: string, context?: string, data?: any) {
    this.logger.info(message, { context, data });
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: string, data?: any) {
    this.logger.debug(message, { context, data });
  }
}
