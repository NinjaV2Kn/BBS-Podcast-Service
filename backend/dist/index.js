"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const episodes_1 = __importDefault(require("./routes/episodes"));
const podcasts_1 = __importDefault(require("./routes/podcasts"));
const categories_1 = __importDefault(require("./routes/categories"));
const feeds_1 = __importDefault(require("./routes/feeds"));
const play_1 = __importDefault(require("./routes/play"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Logger
const logger = (0, pino_http_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});
// Middleware
app.use(logger);
// Helmet with custom CSP for media serving
app.use((0, helmet_1.default)({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'"],
            fontSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
}));
// CORS - Allow all origins for development
app.use((0, cors_1.default)({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Type'],
    maxAge: 86400,
}));
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_1.default);
app.use('/uploads', uploads_1.default);
app.use('/episodes', episodes_1.default);
app.use('/podcasts', podcasts_1.default);
app.use('/categories', categories_1.default);
app.use('/feeds', feeds_1.default);
app.use('/play', play_1.default);
app.use('/api/dashboard', dashboard_1.default);
// Health check (for Docker healthcheck & monitoring)
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'podcast-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Ready check (for Kubernetes/Docker readiness)
app.get('/ready', (_req, res) => {
    // Check if services are ready
    res.status(200).json({
        status: 'ready',
        service: 'podcast-backend',
    });
});
// Serve frontend static files
const publicPath = path_1.default.join(__dirname, 'public');
app.use(express_1.default.static(publicPath, {
    index: false,
    extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'gif', 'svg', 'ico', 'webp'],
}));
// SPA fallback - all non-API requests go to index.html
app.get('*', (req, res) => {
    // Skip API routes - they should have been handled above
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/uploads') ||
        req.path.startsWith('/episodes') || req.path.startsWith('/podcasts') ||
        req.path.startsWith('/categories') || req.path.startsWith('/feeds') ||
        req.path.startsWith('/play') || req.path.startsWith('/health') ||
        req.path.startsWith('/ready')) {
        return res.status(404).json({ error: 'Not found' });
    }
    return res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
