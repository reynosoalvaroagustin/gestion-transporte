import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;