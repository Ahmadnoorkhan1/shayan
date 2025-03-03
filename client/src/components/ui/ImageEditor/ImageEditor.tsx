import React, { useEffect, useRef } from 'react';
import { UIEvent, PhotoEditorSDKUI } from 'photoeditorsdk';
import Image from "/images/auth/mountain.png";

interface ImageEditorProps {
  initialImageUrl: string;
  onImageSelect?: (imageSrc: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImageUrl, onImageSelect }) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    let editor: any = null;

    const initEditor = async () => {
      try {
        editor = await PhotoEditorSDKUI.init({
          container: '#editor',
          image: Image,
          license: '', // Add your license key here
        });

        console.log('PhotoEditorSDK for Web is ready!');

        editor.on(UIEvent.EXPORT, (imageSrc: string) => {
          console.log('Exported ', imageSrc);
          onImageSelect?.(imageSrc);
        });
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      if (editor) {
        try {
          editor.dispose();
        } catch (error) {
          console.warn('Error disposing editor:', error);
        }
      }
    };
  }, [initialImageUrl, onImageSelect]);

  return (
    <div
      id="editor"
      ref={editorRef}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  );
};

export default ImageEditor;