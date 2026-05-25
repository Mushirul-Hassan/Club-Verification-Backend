const express = require('express');
const { uploadVerificationImages } = require('../middlewares/uploadMiddleware');
const { processVerification } = require('../controllers/verifyController');

const router = express.Router();

// The route definition is now incredibly easy to read
router.post('/verify', uploadVerificationImages, processVerification);

module.exports = router;