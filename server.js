import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import 'dotenv/config';


import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
// import doorRoutes from './routes/doorRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 3000;



connectDB();


app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000',  'https://club-verification-backend.onrender.com',], 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); 

//  Rate Limiter: Max 10 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests, please try again in a minute." }
});


app.use('/api/user', apiLimiter, userRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
// app.use('/api/door', apiLimiter, doorRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Club API Server running on port ${PORT}`);
});