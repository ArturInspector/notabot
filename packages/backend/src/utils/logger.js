// structured logger

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };

  // colors for console
  const colors = {
    INFO: '\x1b[36m',  // Cyan
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
    DEBUG: '\x1b[90m'  // Gray
  };
  const reset = '\x1b[0m';

  const color = colors[level] || '';
  console.log(`${color}[${timestamp}] ${level}:${reset}`, message, meta);
}

export const logger = {
  info: (message, meta) => log(LOG_LEVELS.INFO, message, meta),
  warn: (message, meta) => log(LOG_LEVELS.WARN, message, meta),
  error: (message, meta) => log(LOG_LEVELS.ERROR, message, meta),
  debug: (message, meta) => log(LOG_LEVELS.DEBUG, message, meta)
};

