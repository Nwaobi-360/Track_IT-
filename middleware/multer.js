const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../media'); // Adjust the destination path as needed
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop(); // Extract file extension
        cb(null, req.body.firstName + '_profile_picture.' + extension); // Construct filename
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Supported image format
    } else {
        cb(new Error('Unsupported image format'), false); // Unsupported image format
    }
};

const mediaUpload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 4 }, // Adjust the file size limit as needed
    fileFilter: fileFilter
});

module.exports = mediaUpload;
