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
 * Handles both http and https, and any localhost port
 */
export const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url) return url || null;
  
  // Convert http://localhost:XXXX/path or https://localhost:XXXX/path to /path
  const localhostMatch = url.match(/https?:\/\/localhost:\d+(.+)/);
  if (localhostMatch) {
    return localhostMatch[1];
  }
  
  // Convert any http://host/uploads or https://host/uploads to /uploads (production domain URLs)
  // This handles the presigned URL case where we just want the path part
  const uploadPathMatch = url.match(/https?:\/\/[^/]+(\/.+)/);
  if (uploadPathMatch) {
    const path = uploadPathMatch[1];
    // Only normalize if it's an uploads path
    if (path.includes('/uploads/') || path.includes('/file/')) {
      return path;
    }
  }
  
  return url;
};
