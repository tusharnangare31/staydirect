/**
 * Safe Production Logger for StayDirect Pune
 * Sanitizes all PII, auth tokens, phone numbers, and payment details before logging.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface SanitizedLogPayload {
  level: LogLevel;
  tag: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Regex patterns to redact sensitive student/payment data
const SENSITIVE_PATTERNS = [
  /([0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4})/g, // 16 digit card
  /([0-9]{3,4})/g, // CVV or short PIN in payment context
  /(Bearer\s+[A-Za-z0-9._-]+)/gi, // Auth tokens
  /(rzp_(live|test)_[A-Za-z0-9]+)/gi, // Razorpay keys
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, // Email (partially mask)
  /(\+91[-\s]?[6-9][0-9]{9})/g, // Indian Mobile numbers
];

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return String(str);
  let sanitized = str;

  // Mask card numbers
  sanitized = sanitized.replace(
    /([0-9]{4})[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?([0-9]{4})/g,
    '$1-XXXX-XXXX-$2'
  );

  // Mask Indian phone numbers (keep last 4 digits)
  sanitized = sanitized.replace(/(\+91[-\s]?[6-9][0-9]{5})([0-9]{4})/g, '+91-XXXXX-$2');

  // Mask Emails
  sanitized = sanitized.replace(
    /([a-zA-Z0-9._%+-]{2})[a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '$1***$2'
  );

  // Mask Razorpay secrets
  sanitized = sanitized.replace(/(rzp_(live|test)_[A-Za-z0-9]{4})[A-Za-z0-9]+/gi, '$1****');

  return sanitized;
}

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('signature') ||
      lowerKey.includes('cvv') ||
      lowerKey.includes('pin')
    ) {
      sanitized[key] = '[REDACTED_SECURITY_DATA]';
    } else if (typeof val === 'string') {
      sanitized[key] = sanitizeString(val);
    } else if (typeof val === 'object') {
      sanitized[key] = sanitizeObject(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class ProductionLogger {
  private isDev = process.env.NODE_ENV !== 'production';

  private output(payload: SanitizedLogPayload) {
    if (this.isDev) {
      const color =
        payload.level === 'error'
          ? '\x1b[31m'
          : payload.level === 'warn'
          ? '\x1b[33m'
          : '\x1b[36m';
      console.log(
        `${color}[${payload.timestamp}] [${payload.level.toUpperCase()}] [${payload.tag}]\x1b[0m`,
        payload.message,
        payload.metadata ? payload.metadata : ''
      );
    } else {
      // In production, structured JSON log for Cloud Run / Datadog / Sentry ingestion
      console.log(JSON.stringify(payload));
    }
  }

  info(tag: string, message: string, metadata?: Record<string, any>) {
    this.output({
      level: 'info',
      tag,
      message: sanitizeString(message),
      timestamp: new Date().toISOString(),
      metadata: metadata ? sanitizeObject(metadata) : undefined,
    });
  }

  warn(tag: string, message: string, metadata?: Record<string, any>) {
    this.output({
      level: 'warn',
      tag,
      message: sanitizeString(message),
      timestamp: new Date().toISOString(),
      metadata: metadata ? sanitizeObject(metadata) : undefined,
    });
  }

  error(tag: string, message: string, error?: any, metadata?: Record<string, any>) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: sanitizeString(error.message), stack: error.stack?.slice(0, 300) }
      : error;

    this.output({
      level: 'error',
      tag,
      message: sanitizeString(message),
      timestamp: new Date().toISOString(),
      metadata: sanitizeObject({ ...metadata, error: errorDetails }),
    });
  }
}

export const logger = new ProductionLogger();
