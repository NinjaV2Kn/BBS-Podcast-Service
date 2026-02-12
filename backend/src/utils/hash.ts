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

/**
 * Normalize URLs: convert absolute localhost URLs to relative paths for CSP compliance
 */
export const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url) return url || null;
  
  // Convert http://localhost:8080/path to /path
  if (url.includes('http://localhost:8080/')) {
    return url.replace('http://localhost:8080', '');
  }
  
  // Convert any http://localhost:XXXX/path to /path
  if (url.includes('localhost:') && url.includes('http://')) {
    const match = url.match(/http:\/\/localhost:\d+(.+)/);
    if (match) {
      return match[1];
    }
  }
  
  return url;
};
