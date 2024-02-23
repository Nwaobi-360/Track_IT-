// // middleware/fileUploadMiddleware.js
// const multer = require('multer');

// // Set up multer to store uploaded images in the 'uploads' directory
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '_' + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
