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

  const handleSave = (editedImageObject: any) => {
    console.log('Edited Image Object:', editedImageObject);
    if (editedImageObject?.imageBase64) {
      onSave(editedImageObject.imageBase64);
      setIsImgEditorShown(false);
    }
  };

  // const config = {
  //   source: initialImageUrl,
  //   onSave: handleSave,
  //   onClose: () => setIsImgEditorShown(false),
  //   annotationsCommon: {
  //     fill: '#ff0000',
  //     stroke: '#000000',
  //     strokeWidth: 2,
  //   },
  //   Rotate: { 
  //     angle: 90, 
  //     componentType: 'slider' 
  //   },
  //   Crop: {
  //     presetsItems: [
  //       {
  //         titleKey: 'classicTv',
  //         descriptionKey: '4:3',
  //         ratio: 4 / 3,
  //       },
  //       {
  //         titleKey: 'widescreen',
  //         descriptionKey: '16:9',
  //         ratio: 16 / 9,
  //       },
  //     ],
  //     minWidth: 100,
  //     minHeight: 100,
  //   },
  //   tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.FILTERS],
  //   defaultTabId: TABS.ADJUST,
  //   defaultToolId: TOOLS.CROP,
  //   onBeforeComplete: () => true,
  //   showInModal: false,
  //   translations: {
  //     save: 'Apply Changes',
  //     cancel: 'Cancel',
  //     reset: 'Reset All',
  //   },
  // };

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
      componentType: 'slider' as const // Fix TypeScript error by using const assertion
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
    defaultTabId: TABS.ADJUST,
    defaultToolId: TOOLS.CROP,
    onBeforeComplete: () => true,
    showInModal: false,
    translations: {
      save: 'Apply Changes',
      cancel: 'Cancel',
      reset: 'Reset All',
    },
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
    {isImgEditorShown && (
      <div className="flex flex-col">
      
        <div className="relative h-[450px] md:h-[500px]"> {/* Adjusted height */}
          {isImgEditorShown && initialImageUrl && (
            <FilerobotImageEditor
              {...config}
              savingPixelRatio={2} // Reduced for better performance
              previewPixelRatio={2}
              observePluginContainerSize
              showInModal={false}
              className="w-full h-full" // Added className
            />
          )}
        </div>
      </div>
    )}
  </div>
  );
};

export default ImageEditor;