import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import logRoutes from './routes/logRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import twinRoutes from './routes/twinRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables for Digital Twin core
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/twin', twinRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'Digital Twin Student API running successfully!' });
});

// Fallback middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
