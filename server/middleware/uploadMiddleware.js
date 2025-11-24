const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage settings for Multer
const storage = multer.diskStorage({
    // Destination: Where to save the uploaded files
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to 'uploads' directory
    },
    // Filename: How to name the saved files
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting
        // Format: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter: Restrict uploads to specific file types
const fileFilter = (req, file, cb) => {
    // Accept images only (jpg, jpeg, png, gif)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    // Accept the file
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
