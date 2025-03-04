import React, { useState } from 'react';
import FilerobotImageEditor, {
  TABS,
  TOOLS,
  FilerobotImageEditorConfig,
} from 'react-filerobot-image-editor';

interface ImageEditorProps {
  initialImageUrl: string; // Make this required
  onSave: (editedImageUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImageUrl, onSave }) => {
  const [isImgEditorShown, setIsImgEditorShown] = useState<boolean>(true);

  const handleSave = (editedImageObject: any) => {
    console.log('Edited Image Object:', editedImageObject);
    
    if (editedImageObject?.imageBase64) {
      onSave(editedImageObject.imageBase64);
      setIsImgEditorShown(false);
    }
  };

  const config: any = {
    source: initialImageUrl || '', // Provide empty string as fallback
    onSave: handleSave,
    onClose: () => setIsImgEditorShown(false),
    annotationsCommon: {
      fill: '#ff0000'
    },
    Rotate: { angle: 90, componentType: 'slider' },
    Crop: {
      presetsItems: [
        {
          titleKey: 'classicTv',
          descriptionKey: '4:3',
          ratio: 4 / 3,
        }
      ]
    },
    tabsIds: [TABS.ADJUST, TABS.ANNOTATE],
    defaultTabId: TABS.ADJUST,
    defaultToolId: TOOLS.CROP,
    onBeforeComplete: () => true, // Add this to prevent double confirmation
    showInModal: false, // Add this to prevent modal behavior
    onBeforeSave: () => true,
    translations: {
      save: 'Apply Changes',
      cancel: 'Cancel'
    }
  };

  // Only render if we have an initial URL
  return (
    <div className="h-[600px]">
      {isImgEditorShown && initialImageUrl && (
        <FilerobotImageEditor
          {...config}
          savingPixelRatio={4}
          previewPixelRatio={4}
          observePluginContainerSize
        />
      )}
    </div>
  );
};

export default ImageEditor;