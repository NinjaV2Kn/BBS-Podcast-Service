import express, { Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
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


// Health check
app.get('/health', (_req, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
