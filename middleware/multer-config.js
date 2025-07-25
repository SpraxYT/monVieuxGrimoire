const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images/temp');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '_' + Date.now() + '.' + extension);
  }
});

const fileFilter = (req, file, callback) => {
  const isValidMimeType = !!MIME_TYPES[file.mimetype];
  if (isValidMimeType) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type! Only JPG, JPEG, PNG, and WebP are allowed.'), false);
  }
};

module.exports = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
}).single('image');
