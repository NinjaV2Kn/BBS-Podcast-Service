"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const auth_1 = __importDefault(require("./routes/auth"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const episodes_1 = __importDefault(require("./routes/episodes"));
const podcasts_1 = __importDefault(require("./routes/podcasts"));
const feeds_1 = __importDefault(require("./routes/feeds"));
const play_1 = __importDefault(require("./routes/play"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const youtube_1 = __importDefault(require("./routes/youtube"));
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
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow local development on any localhost port
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        }
        else {
            // In production, only allow configured FRONTEND_URL
            const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
            if (origin === allowedOrigin) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_1.default);
app.use('/uploads', uploads_1.default);
app.use('/episodes', episodes_1.default);
app.use('/podcasts', podcasts_1.default);
app.use('/feeds', feeds_1.default);
app.use('/play', play_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/youtube', youtube_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
