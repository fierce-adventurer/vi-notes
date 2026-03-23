import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes'
import { setupSwagger } from './config/swagger';

dotenv.config();

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`👉 Test the API at: http://localhost:${PORT}/api-docs`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database. Server not started.', error);
    process.exit(1);
});

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

app.get('/', (req, res) => {
  res.send('Vi-Notes API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
