const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/avatars',
    'uploads/thumbnails',
    'uploads/assignments'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Dynamic storage config based on file field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine folder based on field name
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars';
    } else if (file.fieldname === 'thumbnail') {
      uploadPath += 'thumbnails';
    } else if (file.fieldname === 'file') {
      uploadPath += 'assignments';
    } else {
      uploadPath += 'misc';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for all files (for assignments)
const allFilesFilter = (req, file, cb) => {
  cb(null, true);
};

// Avatar upload - images only, 2MB max
const avatarUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Thumbnail upload - images only, 5MB max
const thumbnailUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Assignment upload - all files, 10MB max
const assignmentUpload = multer({
  storage,
  fileFilter: allFilesFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Generic upload for backward compatibility
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Use appropriate filter based on field name
    if (file.fieldname === 'avatar' || file.fieldname === 'thumbnail') {
      imageFilter(req, file, cb);
    } else {
      allFilesFilter(req, file, cb);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = upload;
module.exports.avatarUpload = avatarUpload;
module.exports.thumbnailUpload = thumbnailUpload;
module.exports.assignmentUpload = assignmentUpload;