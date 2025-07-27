const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  try {
    const tempFilePath = req.file.path;
    const filename = req.file.filename;
    
    // Create optimized image directory if it doesn't exist
    const optimizedDir = path.join('images', 'optimized');
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
    }
    
    const optimizedFilePath = path.join(optimizedDir, filename);
    
    // Optimize the image
    await sharp(tempFilePath)
      .resize(415, 415, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality for better compression
      .toFile(path.join('images', 'optimized', filename.split('.')[0] + '.webp'));
    
    // Update the file information in the request
    req.file.path = path.join('images', 'optimized', filename.split('.')[0] + '.webp');
    req.file.filename = filename.split('.')[0] + '.webp';
    
    // Clean up the temporary file
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
    
    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};
