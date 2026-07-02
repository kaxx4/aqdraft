const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { authMiddleware, requireActiveMember } = require('../middleware/auth');

// Image uploader — 5MB per file, 4 files max, image mimetypes only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 4 // Max 4 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Document uploader — separate multer instance because PDFs/PPTXs run
// larger than images and the mimetype allowlist is different. 15MB cap
// per file keeps things sane; bump if real-world decks exceed it.
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 3 // Max 3 documents per post
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and PPTX are allowed.'));
    }
  }
});

// Upload post images (max 4)
router.post(
  '/images',
  authMiddleware,
  requireActiveMember,
  upload.array('images', 4),
  uploadController.uploadImages
);

// Upload post documents (PDF / PPTX, max 3)
router.post(
  '/documents',
  authMiddleware,
  requireActiveMember,
  docUpload.array('documents', 3),
  uploadController.uploadDocuments
);

// Upload avatar
router.post(
  '/avatar',
  authMiddleware,
  upload.single('avatar'),
  uploadController.uploadAvatar
);

module.exports = router;
