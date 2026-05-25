const multer = require('multer');

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export the specific configuration for our verification route
const uploadVerificationImages = upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
]);

module.exports = { uploadVerificationImages };