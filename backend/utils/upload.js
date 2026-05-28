const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Thumbnail storage (course images) ──────────────────────────
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 450, crop: 'fill' }],
  },
});

// ── Avatar storage (user profile pics) ─────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  },
});

// ── Assignment storage (PDFs, docs, etc.) ──────────────────────
const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    return {
      folder: 'lms/assignments',
      resource_type: isPdf ? 'image' : 'raw', // PDF as 'image' type allows inline browser viewing
      allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip', 'jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

// ── Multer instances ────────────────────────────────────────────
const thumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Default export for backward compatibility
const upload = multer({ storage: thumbnailStorage });

module.exports = upload;
module.exports.avatarUpload = avatarUpload;
module.exports.thumbnailUpload = thumbnailUpload;
module.exports.assignmentUpload = assignmentUpload;
module.exports.cloudinary = cloudinary;   // export for direct use if needed