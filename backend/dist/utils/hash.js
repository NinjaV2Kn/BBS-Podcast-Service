"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayIdentifier = exports.hashString = void 0;
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
