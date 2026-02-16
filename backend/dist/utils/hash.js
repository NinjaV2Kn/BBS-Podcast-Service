"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = exports.createPlayIdentifier = exports.hashString = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Hash IP address or user-agent for GDPR-compliant storage
 */
const hashString = (value) => {
    return crypto_1.default.createHash('sha256').update(value).digest('hex');
};
exports.hashString = hashString;
/**
 * Combine IP and User-Agent into a single anonymized identifier
 */
const createPlayIdentifier = (ip, userAgent) => {
    const combined = `${ip}:${userAgent}`;
    return (0, exports.hashString)(combined);
};
exports.createPlayIdentifier = createPlayIdentifier;
/**
 * Normalize URLs: convert absolute localhost URLs to relative paths for CSP compliance
 * Handles both http and https, and any localhost port
 */
const normalizeUrl = (url) => {
    if (!url)
        return url || null;
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
exports.normalizeUrl = normalizeUrl;
