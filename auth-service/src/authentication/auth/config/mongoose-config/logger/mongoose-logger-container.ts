// database/mongoose.logger.ts
import { Logger } from '@nestjs/common';

export class MongooseLogger {
  private readonly logger: Logger;

  constructor(context = 'Mongoose') {
    this.logger = new Logger(context);
  }

  logEvent(connection) {
    connection.on('connected', () => {
      this.logger.log('Database connection established.');
    });

    connection.on('error', (err) => {
      this.logger.error('Database connection error:', err);
    });

    connection.on('disconnected', () => {
      this.logger.warn('Database connection disconnected.');
    });
  }
}
