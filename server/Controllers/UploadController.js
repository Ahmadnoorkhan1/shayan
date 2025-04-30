const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../Utils/cloudflareStorage');

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../temp-uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept all file types for now - you can add restrictions here
  cb(null, true);
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

/**
 * Handle single file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadSingleFile = async (req, res) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get the file path from multer
    const filePath = req.file.path;
    const folderPath = req.body.folder || ''; // Optional folder path
    
    // Upload to Cloudflare R2
    const fileStream = fs.createReadStream(filePath);
    const fileName = req.file.originalname;
    const contentType = req.file.mimetype;
    
    const fileUrl = await uploadFile(fileStream, fileName, folderPath, contentType);
    
    // Clean up the temporary file
    fs.unlinkSync(filePath);
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        originalName: fileName,
        size: req.file.size,
        mimeType: contentType
      }
    });
    
  } catch (error) {
    console.error('Error in file upload controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

/**
 * Handle multiple file uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMultipleFiles = async (req, res) => {
  try {
    // Check if files exist in request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const folderPath = req.body.folder || ''; // Optional folder path
    const uploadResults = [];
    const errors = [];
    
    // Process each file
    for (const file of req.files) {
      try {
        const filePath = file.path;
        const fileStream = fs.createReadStream(filePath);
        const fileName = file.originalname;
        const contentType = file.mimetype;
        
        // Upload to Cloudflare R2
        const fileUrl = await uploadFile(fileStream, fileName, folderPath, contentType);
        
        // Clean up temporary file
        fs.unlinkSync(filePath);
        
        uploadResults.push({
          url: fileUrl,
          originalName: fileName,
          size: file.size,
          mimeType: contentType
        });
      } catch (fileError) {
        console.error(`Error uploading file ${file.originalname}:`, fileError);
        errors.push({
          fileName: file.originalname,
          error: fileError.message
        });
        
        // Clean up temporary file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    // Return results
    return res.status(200).json({
      success: true,
      message: `Files uploaded: ${uploadResults.length}, Errors: ${errors.length}`,
      data: {
        files: uploadResults,
        errors: errors
      }
    });
    
  } catch (error) {
    console.error('Error in multiple file upload controller:', error);
    
    // Clean up any remaining temporary files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

/**
 * Delete a file from R2 storage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFileHandler = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }
    
    await deleteFile(fileUrl);
    
    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFileHandler,
  upload // Export multer middleware
}; 