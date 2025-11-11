import express, { Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import authRouter from './routes/auth';

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
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRouter);

// Health check
app.get('/health', (_req, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
