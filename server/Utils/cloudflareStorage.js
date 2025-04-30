const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://d3ad87fbd522fd84c61f2c1419f9bbcc.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '17e47e5bc8118c6f0d3149b500f0834b',
    secretAccessKey: '44e75ecd3de21a2765ff63f230eed68ac62790538497d15506243acb7ccb5b83',
  },
});

// Bucket name - you might want to set this in your .env file
const BUCKET_NAME = 'files'; // Set your bucket name here

/**
 * Uploads a file to Cloudflare R2 storage
 * @param {Buffer|ReadableStream} fileContent - File content as buffer or stream
 * @param {string} fileName - Name of the file with extension
 * @param {string} folderPath - Optional folder path inside bucket
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadFile = async (fileContent, fileName, folderPath = '', contentType = 'application/octet-stream') => {
  try {
    // Generate a unique file name to avoid overwriting
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Create the full key (path) in the bucket
    const key = folderPath ? `${folderPath}/${uniqueFileName}` : uniqueFileName;
    
    // Create upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    };

    // Use the Upload utility for better handling of larger files
    const upload = new Upload({
      client: r2Client,
      params: uploadParams,
    });

    await upload.done();
    
    // Return the public URL where the file can be accessed
    return `https://files.minilessonsacademy.com/files/${key}`;
  } catch (error) {
    console.error('Error uploading file to Cloudflare R2:', error);
    throw error;
  }
};

/**
 * Deletes a file from Cloudflare R2 storage
 * @param {string} fileKey - Full path/key of the file in the bucket
 * @returns {Promise<boolean>} - Success status
 */
const deleteFile = async (fileKey) => {
  try {
    // Extract the key from the public URL if needed
    const key = fileKey.includes('files.minilessonsacademy.com/files/') 
      ? fileKey.split('files.minilessonsacademy.com/files/')[1]
      : fileKey;
    
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await r2Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error('Error deleting file from Cloudflare R2:', error);
    throw error;
  }
};

/**
 * Gets a temporary URL for private files (optional)
 * @param {string} fileKey - Full path/key of the file in the bucket
 * @param {number} expirationSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Temporary URL
 */
const getSignedUrl = async (fileKey, expirationSeconds = 3600) => {
  try {
    // Extract the key from the public URL if needed
    const key = fileKey.includes('files.minilessonsacademy.com/files/') 
      ? fileKey.split('files.minilessonsacademy.com/files/')[1]
      : fileKey;
      
    // Note: For Cloudflare R2, this is a simplified approach - they don't support getSignedUrl directly like AWS
    // You would need to implement custom logic with proper signing if you really need pre-signed URLs
    
    // For public files, you can just return the public URL
    return `https://files.minilessonsacademy.com/files/${key}`;
  } catch (error) {
    console.error('Error generating signed URL from Cloudflare R2:', error);
    throw error;
  }
};

/**
 * Upload a local file from disk to Cloudflare R2
 * @param {string} filePath - Path to the local file
 * @param {string} folderPath - Optional folder path in bucket
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadLocalFile = async (filePath, folderPath = '') => {
  try {
    const fileName = path.basename(filePath);
    const fileContent = fs.createReadStream(filePath);
    const contentType = getContentType(fileName);
    
    return await uploadFile(fileContent, fileName, folderPath, contentType);
  } catch (error) {
    console.error('Error uploading local file to Cloudflare R2:', error);
    throw error;
  }
};

/**
 * Helper function to determine content type based on file extension
 * @param {string} fileName - Name of the file with extension
 * @returns {string} - MIME type
 */
const getContentType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  uploadLocalFile,
  r2Client,
  BUCKET_NAME
}; 