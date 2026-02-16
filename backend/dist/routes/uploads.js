"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const minio_1 = require("../utils/minio");
const auth_1 = require("../middleware/auth");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const PresignSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1),
});
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// POST /uploads/presign - Generate presigned URL for upload
router.post('/presign', auth_1.auth, async (req, res) => {
    try {
        const body = PresignSchema.parse(req.body);
        // Generate unique object key
        const timestamp = Date.now();
        const objectKey = `${timestamp}-${body.filename}`;
        // Generate presigned URL from MinIO
        const presignedUrl = await (0, minio_1.generatePresignedUrl)(process.env.S3_BUCKET_PODCASTS || 'podcasts', objectKey, 3600 // 1 hour expiry
        );
        return res.json({
            url: presignedUrl,
            objectKey,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Presign error:', error);
        return res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});
// PUT /uploads/file/:filename - Handle local file upload (development mode)
router.put('/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Ensure filename doesn't try to escape the uploads directory
        if (!filepath.startsWith(uploadsDir)) {
            res.status(400).json({ error: 'Invalid filename' });
            return;
        }
        // Write file from request body
        const writeStream = fs_1.default.createWriteStream(filepath);
        return new Promise((resolve, reject) => {
            req.pipe(writeStream);
            writeStream.on('finish', () => {
                res.json({
                    success: true,
                    url: `/uploads/file/${filename}`
                });
                resolve();
            });
            writeStream.on('error', (error) => {
                res.status(500).json({ error: 'Failed to save file' });
                reject(error);
            });
            req.on('error', (error) => {
                res.status(500).json({ error: 'Failed to upload file' });
                reject(error);
            });
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// OPTIONS /uploads/file/:filename - Handle preflight requests
router.options('/file/:filename', (_req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range, Content-Range',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type',
        'Access-Control-Max-Age': '86400'
    });
    res.sendStatus(200);
});
// HEAD /uploads/file/:filename - Support HEAD requests
router.head('/file/:filename', (_req, res) => {
    try {
        const filename = _req.params.filename;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Ensure filename doesn't try to escape the uploads directory
        if (!filepath.startsWith(uploadsDir)) {
            res.header('Access-Control-Allow-Origin', '*');
            return res.status(400).end();
        }
        // Check if file exists
        if (!fs_1.default.existsSync(filepath)) {
            res.header('Access-Control-Allow-Origin', '*');
            return res.status(404).end();
        }
        // Set CORS headers for HEAD
        const stat = fs_1.default.statSync(filepath);
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range, Content-Range',
            'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type',
            'Content-Length': stat.size.toString(),
            'Accept-Ranges': 'bytes'
        });
        return res.end();
    }
    catch (error) {
        console.error('HEAD error:', error);
        res.header('Access-Control-Allow-Origin', '*');
        return res.status(500).end();
    }
});
// GET /uploads/file/:filename - Serve uploaded file with proper CORS and Range support
router.get('/file/:filename', (_req, res) => {
    try {
        // Set CORS headers FIRST, before everything else
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Range, Content-Range');
        res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');
        res.header('Accept-Ranges', 'bytes');
        res.header('Cache-Control', 'public, max-age=3600');
        res.header('Content-Type', 'audio/mpeg');
        const filename = _req.params.filename;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Ensure filename doesn't try to escape the uploads directory
        if (!filepath.startsWith(uploadsDir)) {
            return res.status(400).json({ error: 'Invalid filename' });
        }
        // Check if file exists
        if (!fs_1.default.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const stat = fs_1.default.statSync(filepath);
        const fileSize = stat.size;
        // Handle Range requests
        const range = _req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            if (start >= fileSize) {
                res.header('Content-Range', `bytes */${fileSize}`);
                return res.status(416).send();
            }
            res.status(206);
            res.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.header('Content-Length', (end - start + 1).toString());
            const stream = fs_1.default.createReadStream(filepath, { start, end });
            return stream.pipe(res);
        }
        else {
            // No range request, send full file
            res.header('Content-Length', fileSize.toString());
            const stream = fs_1.default.createReadStream(filepath);
            return stream.pipe(res);
        }
    }
    catch (error) {
        console.error('Serve file error:', error);
        return res.status(500).json({ error: 'Failed to serve file' });
    }
});
exports.default = router;
