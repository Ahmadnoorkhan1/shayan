import React, { useState } from 'react';
import FilerobotImageEditor, {
  FilerobotImageEditorConfig,
  TABS,
  TOOLS,
} from 'react-filerobot-image-editor';

interface ImageEditorProps {
  initialImageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImageUrl, onSave }) => {
  const [isImgEditorShown, setIsImgEditorShown] = useState<boolean>(true);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Function to compress the image before saving
  const compressImage = async (imageBase64: string): Promise<string> => {
    setIsCompressing(true);
    
    try {
      // Create an image element to load the base64 data
      const img = new Image();
      img.src = imageBase64;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Create a canvas to resize and compress the image
      const canvas = document.createElement('canvas');
      
      // Calculate dimensions - limit to max 1200px while preserving aspect ratio
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;
      
      // Resize if needed while maintaining aspect ratio
      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }
      
      if (height > MAX_HEIGHT) {
        width = Math.round(width * (MAX_HEIGHT / height));
        height = MAX_HEIGHT;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image onto the canvas with the new dimensions
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG format with quality 0.85 (85%)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      
      console.log('Original size:', Math.round(imageBase64.length / 1024), 'KB');
      console.log('Compressed size:', Math.round(compressedBase64.length / 1024), 'KB');
      
      return compressedBase64;
    } catch (error) {
      console.error('Error compressing image:', error);
      return imageBase64; // Return original if compression fails
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async (editedImageObject: any) => {
    console.log('Edited Image Object received');
    if (editedImageObject?.imageBase64) {
      try {
        // Compress the image before saving
        const compressedImage = await compressImage(editedImageObject.imageBase64);
        onSave(compressedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original if compression fails
        onSave(editedImageObject.imageBase64);
      } finally {
        setIsImgEditorShown(false);
      }
    }
  };

  const config: any = {
    source: initialImageUrl,
    onSave: handleSave,
    onClose: () => setIsImgEditorShown(false),
    annotationsCommon: {
      fill: '#ff0000',
      stroke: '#000000',
      strokeWidth: 2,
    },
    Rotate: { 
      angle: 90, 
      componentType: 'slider' as const
    },
    Crop: {
      presetsItems: [
        {
          titleKey: 'classicTv',
          descriptionKey: '4:3',
          ratio: 4 / 3,
        },
        {
          titleKey: 'widescreen',
          descriptionKey: '16:9',
          ratio: 16 / 9,
        },
      ],
      minWidth: 100,
      minHeight: 100,
    },
    tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.FILTERS],
    defaultTabId: TABS.ANNOTATE,
    defaultToolId: TOOLS.TEXT,
    onBeforeComplete: () => true,
    showInModal: false,
    translations: {
      save: 'Apply Changes',
      cancel: 'Cancel',
      reset: 'Reset All',
    },
    // Explicitly set lower export quality
    Finetune: {
      quality: 85 // JPEG quality 0-100
    }
  };

  if (!initialImageUrl) {
    return (
      <div className="mx-auto max-w-4xl p-5 text-center text-red-800 bg-red-100 border border-red-300 rounded-lg">
        Please provide an image URL to edit
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden">
      {isCompressing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-white mb-2"></div>
            <p>Optimizing image size...</p>
          </div>
        </div>
      )}
      {isImgEditorShown && (
        <div className="flex flex-col">
          <div className="relative h-[450px] md:h-[500px]">
            {isImgEditorShown && initialImageUrl && (
              <FilerobotImageEditor
                {...config}
                savingPixelRatio={1} // Reduced from 2 to 1 for smaller file size
                previewPixelRatio={1.5}
                observePluginContainerSize
                showInModal={false}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;