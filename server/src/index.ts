import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';
import reportRoutes from './routes/reportRoutes';
import { requireAuth } from './middleware/auth';

const app = express();
const allowedOrigins =
  process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim()) || [];

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/wallets', requireAuth, walletRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/reports', requireAuth, reportRoutes);

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

start();
