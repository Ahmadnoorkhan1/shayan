const { uploadFile } = require('./cloudflareStorage'); // Import S3 upload function

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

module.exports = { saveImage };