const fs = require('fs-extra');
const path = require('path');

// Base directories for different content types
const CONTENT_DIRS = {
  book: 'book',
  course: 'course'
};

/**
 * Ensures the content directory exists
 * @param {string} contentType - 'book' or 'course'
 * @param {string|number} contentId - ID of the book or course
 * @returns {string} - Path to the content directory
 */
const ensureContentDir = async (contentType, contentId) => {
  // Normalize content type
  contentType = (contentType && CONTENT_DIRS[contentType.toLowerCase()]) 
    ? CONTENT_DIRS[contentType.toLowerCase()] 
    : 'general';
  
  // Create directory structure: public/images/[contentType]/[contentId]
  const baseDir = path.join(__dirname, '../public/images');
  const contentTypeDir = path.join(baseDir, contentType);
  const contentDir = path.join(contentTypeDir, contentId.toString());
  
  // Ensure directories exist
  await fs.ensureDir(contentDir);
  
  return contentDir;
};

/**
 * Saves image data to file system
 * @param {string|Buffer} imageData - Image data (base64 string or buffer)
 * @param {string} contentType - 'book' or 'course'
 * @param {string|number} contentId - ID of the book or course
 * @param {string} description - Optional description for the image
 * @returns {Object} - Image metadata
 */
const saveImage = async (imageData, contentType, contentId, description = '') => {
  try {
    // Ensure content directory exists
    const contentDir = await ensureContentDir(contentType, contentId);
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `cover_${timestamp}.png`;
    const imagePath = path.join(contentDir, filename);
    
    // If imageData is a base64 string starting with data:image
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      // Extract the base64 part
      const base64Data = imageData.split(';base64,').pop();
      await fs.writeFile(imagePath, base64Data, { encoding: 'base64' });
    } else if (Buffer.isBuffer(imageData)) {
      // If it's already a buffer
      await fs.writeFile(imagePath, imageData);
    } else {
      throw new Error('Invalid image data format');
    }
    
    // Create image metadata
    const imageMetadata = {
      id: timestamp,
      filename,
      path: `/images/${contentType}/${contentId}/${filename}`,
      contentType,
      contentId,
      description,
      createdAt: new Date().toISOString()
    };
    
    // Update metadata file with new image
    const metadataPath = path.join(contentDir, 'metadata.json');
    let metadata = { images: [] };
    
    if (await fs.pathExists(metadataPath)) {
      try {
        metadata = await fs.readJson(metadataPath);
      } catch (error) {
        console.error('Error reading metadata file, creating new one:', error);
      }
    }
    
    // Add new image to metadata
    metadata.images = metadata.images || [];
    metadata.images.push(imageMetadata);
    
    // Save updated metadata
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    
    return imageMetadata;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

/**
 * Gets all images for a content ID
 * @param {string} contentType - 'book' or 'course'
 * @param {string|number} contentId - ID of the book or course
 * @returns {Array} - List of image metadata
 */
const getContentImages = async (contentType, contentId) => {
  try {
    // Normalize content type
    contentType = (contentType && CONTENT_DIRS[contentType.toLowerCase()]) 
      ? CONTENT_DIRS[contentType.toLowerCase()] 
      : 'general';
    
    const contentDir = path.join(__dirname, '../public/images', contentType, contentId.toString());
    const metadataPath = path.join(contentDir, 'metadata.json');
    
    // Check if metadata file exists
    if (!await fs.pathExists(metadataPath)) {
      return { images: [] };
    }
    
    // Read and return metadata
    const metadata = await fs.readJson(metadataPath);
    return metadata;
  } catch (error) {
    console.error('Error getting content images:', error);
    return { images: [] };
  }
};

/**
 * Deletes an image by ID
 * @param {string} contentType - 'book' or 'course'
 * @param {string|number} contentId - ID of the book or course
 * @param {string|number} imageId - ID of the image to delete
 * @returns {boolean} - Success status
 */
const deleteImage = async (contentType, contentId, imageId) => {
  try {
    // Normalize content type
    contentType = (contentType && CONTENT_DIRS[contentType.toLowerCase()]) 
      ? CONTENT_DIRS[contentType.toLowerCase()] 
      : 'general';
    
    const contentDir = path.join(__dirname, '../public/images', contentType, contentId.toString());
    const metadataPath = path.join(contentDir, 'metadata.json');
    
    // Check if metadata file exists
    if (!await fs.pathExists(metadataPath)) {
      return false;
    }
    
    // Read metadata
    const metadata = await fs.readJson(metadataPath);
    
    // Find image in metadata
    const imageIndex = metadata.images.findIndex(img => img.id.toString() === imageId.toString());
    if (imageIndex === -1) {
      return false;
    }
    
    // Get image info and remove from metadata
    const imageToDelete = metadata.images[imageIndex];
    metadata.images.splice(imageIndex, 1);
    
    // Delete the file
    const imagePath = path.join(contentDir, imageToDelete.filename);
    if (await fs.pathExists(imagePath)) {
      await fs.unlink(imagePath);
    }
    
    // Save updated metadata
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

module.exports = {
  saveImage,
  getContentImages,
  deleteImage
};