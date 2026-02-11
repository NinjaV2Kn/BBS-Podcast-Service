import express, { Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import path from 'path';
import authRouter from './routes/auth';
import uploadsRouter from './routes/uploads';
import episodesRouter from './routes/episodes';
import podcastsRouter from './routes/podcasts';
import categoriesRouter from './routes/categories';
import feedsRouter from './routes/feeds';
import playRouter from './routes/play';
import dashboardRouter from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 8080;

// Logger
const logger = pinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Middleware
app.use(logger);

// Helmet with disabled CORP/COOP for uploads
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

// CORS - Allow all origins for development
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Content-Type'],
  maxAge: 86400,
}));

app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/uploads', uploadsRouter);
app.use('/episodes', episodesRouter);
app.use('/podcasts', podcastsRouter);
app.use('/categories', categoriesRouter);
app.use('/feeds', feedsRouter);
app.use('/play', playRouter);
app.use('/api/dashboard', dashboardRouter);


// Health check (for Docker healthcheck & monitoring)
app.get('/health', (_req, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'podcast-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ready check (for Kubernetes/Docker readiness)
app.get('/ready', (_req, res: Response) => {
  // Check if services are ready
  res.status(200).json({ 
    status: 'ready',
    service: 'podcast-backend',
  });
});

// Serve frontend static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { 
  index: false,
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'gif', 'svg', 'ico', 'webp'],
}));

// SPA fallback - all non-API requests go to index.html
app.get('*', (req, res: Response) => {
  // Skip API routes - they should have been handled above
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/uploads') || 
      req.path.startsWith('/episodes') || req.path.startsWith('/podcasts') || 
      req.path.startsWith('/categories') || req.path.startsWith('/feeds') || 
      req.path.startsWith('/play') || req.path.startsWith('/health') || 
      req.path.startsWith('/ready')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
