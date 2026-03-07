import pino from 'pino';

// Centralised logger instance. The log level defaults to 'debug' in non‑production
// environments and 'info' in production. Use this logger throughout the bot
// and worker services instead of console.log to provide structured JSON logs.
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        }
      : undefined,
});