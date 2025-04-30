const express = require('express');
const router = express.Router();
const { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  deleteFileHandler,
  upload
} = require('../Controllers/UploadController');
const {authenticateToken} = require('../Middlewares/AuthMiddleware')

// Route for single file upload
router.post('/upload', authenticateToken, upload.single('file'), uploadSingleFile);

// Route for multiple file upload
router.post('/upload-multiple', authenticateToken, upload.array('files', 10), uploadMultipleFiles);

// Route for file deletion
router.delete('/delete', authenticateToken, deleteFileHandler);

module.exports = router; 