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
            return res.status(400).json({ error: 'Invalid filename' });
        }
        // Write file from request body
        const writeStream = fs_1.default.createWriteStream(filepath);
        req.pipe(writeStream);
        writeStream.on('finish', () => {
            return res.json({
                success: true,
                url: `http://localhost:8080/uploads/file/${filename}`
            });
        });
        writeStream.on('error', (error) => {
            return res.status(500).json({ error: 'Failed to save file' });
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// GET /uploads/file/:filename - Serve uploaded file
router.get('/file/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Ensure filename doesn't try to escape the uploads directory
        if (!filepath.startsWith(uploadsDir)) {
            return res.status(400).json({ error: 'Invalid filename' });
        }
        // Check if file exists
        if (!fs_1.default.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.sendFile(filepath);
    }
    catch (error) {
        console.error('Serve file error:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
});
exports.default = router;
