import crypto from 'crypto';

/**
 * Hash IP address or user-agent for GDPR-compliant storage
 */
export const hashString = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

/**
 * Combine IP and User-Agent into a single anonymized identifier
 */
export const createPlayIdentifier = (ip: string, userAgent: string): string => {
  const combined = `${ip}:${userAgent}`;
  return hashString(combined);
};
