import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const allowedOrigins = [
  'http://localhost:5173',                      
  process.env.FRONTEND_URL                      
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
setupSwagger(app);

// --- 3. ROUTES ---
app.get('/', (req, res) => {
  res.send('Vi-Notes API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`👉 API Docs: http://localhost:${PORT}/api-docs`);
      }
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
