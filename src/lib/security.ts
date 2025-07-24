// Security utilities for the application
import crypto from 'crypto';

/**
 * Generate a cryptographically secure session token
 */
export const generateSecureSessionId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Browser environment - use Web Crypto API
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for other environments
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
};

/**
 * Generate a secure PIN with better entropy
 */
export const generateSecurePin = (length: number = 8): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Encrypt sensitive data for localStorage
 */
export const encryptData = (data: string, key?: string): string => {
  // Simple XOR encryption for localStorage (better than plain text)
  const keyStr = key || 'default-key-' + window.location.hostname;
  let encrypted = '';
  
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length)
    );
  }
  
  return btoa(encrypted);
};

/**
 * Decrypt sensitive data from localStorage
 */
export const decryptData = (encryptedData: string, key?: string): string => {
  try {
    const keyStr = key || 'default-key-' + window.location.hostname;
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length)
      );
    }
    
    return decrypted;
  } catch {
    return '';
  }
};

/**
 * Rate limiting for authentication attempts
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return false;

    if (Date.now() > attempt.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }

    return attempt.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      attempt.count++;
    }
  }

  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return 0;
    return Math.max(0, attempt.resetTime - Date.now());
  }
}

export const pinRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const adminRateLimiter = new RateLimiter(3, 30 * 60 * 1000); // 3 attempts per 30 minutes

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Validate PIN format
 */
export const isValidPinFormat = (pin: string): boolean => {
  return /^[A-Z0-9]{6,12}$/i.test(pin);
};

/**
 * Get client identifier for rate limiting
 */
export const getClientIdentifier = (): string => {
  // Use a combination of user agent and screen properties for identification
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a simple hash of the identifier
  let hash = 0;
  const str = ua + screen + timezone;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};