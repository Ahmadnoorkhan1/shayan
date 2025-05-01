const { ListObjectsCommand } = require('@aws-sdk/client-s3');
const { uploadFile, BUCKET_NAME, r2Client } = require('./cloudflareStorage'); // Import S3 upload function

const saveImage = async (imageData, contentType, contentId, description = '') => {
  try {
    console.log('saveImage called with parameters:', { imageData: imageData.slice(0, 50), contentType, contentId, description });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `cover_${timestamp}.png`;

    // Upload image to S3
    const folderPath = `images/${contentType}/${contentId}`;
    console.log('Uploading image to S3 with folderPath:', folderPath);

    const imageUrl = await uploadFile(Buffer.from(imageData.split(';base64,').pop(), 'base64'), filename, folderPath, 'image/png');

    console.log('Image successfully uploaded to S3. URL:', imageUrl);

    // Create image metadata
    const imageMetadata = {
      id: timestamp,
      filename,
      path: imageUrl, // Use S3 URL
      contentType,
      contentId,
      description,
      createdAt: new Date().toISOString(),
    };

    console.log('Image metadata created:', imageMetadata);

    return imageMetadata;
  } catch (error) {
    console.error('Error in saveImage function:', error);
    throw error;
  }
};

const getImagesFromS3 = async (contentType, contentId) => {
  

  const BUCKET_NAME = 'files'; // Set your bucket name here

  try {
    // Ensure contentType is either 'course' or 'book'
    if (!['course', 'book'].includes(contentType)) {
      throw new Error('Invalid content type. Must be "course" or "book".');
    }

    const folderPath = `images/${contentType}/${contentId}`;
    console.log(`Retrieving images from folderPath: ${folderPath}`);

    const listObjectsCommand = new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: folderPath,
    });

    const response = await r2Client.send(listObjectsCommand);

    if (!response.Contents || response.Contents.length === 0) {
      return [];
    }

    // Generate public URLs for the images
    return response.Contents.map((item) => {
      return {
        key: item.Key,
        url: `https://files.minilessonsacademy.com/${item.Key}`,
      };
    });
  } catch (error) {
    console.error("Error retrieving images from S3:", error.message);
    throw error;
  }
};

module.exports = { saveImage, getImagesFromS3 };