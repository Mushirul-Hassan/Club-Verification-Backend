const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const verifyRoutes = require('./routes/verifyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rate Limiter: Max 10 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests, please try again in a minute." }
});

// Apply routes
app.use('/api', apiLimiter, verifyRoutes);

app.listen(PORT, () => {
    console.log(`Stateless Verification Server running on port ${PORT}`);
});