import React, { useState } from 'react';
import FilerobotImageEditor, {
  TABS,
  TOOLS,
  
} from 'react-filerobot-image-editor';

interface ImageEditorProps {
  onSave?: (editedImageObject: any, designState: any) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onSave }) => {
  const [isImgEditorShown, setIsImgEditorShown] = useState<boolean>(false);

  const openImgEditor = (): void => {
    setIsImgEditorShown(true);
  };

  const closeImgEditor = (): void => {
    setIsImgEditorShown(false);
  };

  const config: any = {
    source: "https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg",
    // onSave: (editedImageObject, designState) => {
    //   console.log('saved', editedImageObject, designState);
    //   onSave?.(editedImageObject, designState);
    // },
    onClose: closeImgEditor,
    annotationsCommon: {
      fill: '#ff0000',
    },
    Text: { text: 'Filerobot...' },
    Rotate: { angle: 90, componentType: 'slider' },
    Crop: {
      presetsItems: [
        {
          titleKey: 'classicTv',
          descriptionKey: '4:3',
          ratio: 4 / 3,
        },
        {
          titleKey: 'cinemascope',
          descriptionKey: '21:9',
          ratio: 21 / 9,
        },
      ],
      presetsFolders: [
        {
          titleKey: 'socialMedia',
          groups: [
            {
              titleKey: 'facebook',
              items: [
                {
                  titleKey: 'profile',
                  width: 180,
                  height: 180,
                  descriptionKey: 'fbProfileSize',
                },
                {
                  titleKey: 'coverPhoto',
                  width: 820,
                  height: 312,
                  descriptionKey: 'fbCoverPhotoSize',
                },
              ],
            },
          ],
        },
      ],
    },
    tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK],
    defaultTabId: TABS.ANNOTATE,
    defaultToolId: TOOLS.TEXT,
  };

  return (
    <div>
      <button 
        onClick={openImgEditor}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Open Image Editor
      </button>
      
      {isImgEditorShown && (
        <FilerobotImageEditor
          {...config}
        />
      )}
    </div>
  );
};

export default ImageEditor;