import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Book, ImageIcon, Edit2, CheckCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import ImageGenerator from '../../ui/ImageGenerator';
import ImageEditor from '../../ui/ImageEditor/ImageEditor';

interface GenerateCoverProps {
  onCoverImageGenerated?: (imageUrl: string) => void;
}

export const GenerateCover: React.FC<GenerateCoverProps> = ({ onCoverImageGenerated }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'generate' | 'edit'>('generate');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleDirectUse = () => {
    if (generatedImage && onCoverImageGenerated) {
      onCoverImageGenerated(generatedImage);
    }
    handleClose();
  };

  const handleImageEdited = (editedImageUrl: string) => {
    if (onCoverImageGenerated) {
      onCoverImageGenerated(editedImageUrl);
    }
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentStep('generate');
    setGeneratedImage(null);
  };

  return (
    <>
      <Button 
        color="destructive"
        variant="soft"
        size='sm'
        onClick={() => setShowModal(true)}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
      >
        <Book className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-700">Book Cover</span>
      </Button>

      <Modal 
        isOpen={showModal}
        onClose={handleClose}
        title={currentStep === 'generate' ? "Generate Book Cover" : "Edit Book Cover"}
      >
        <div className="flex flex-col gap-4">
          {currentStep === 'generate' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate a cover image for your book using AI.
              </p>
              <ImageGenerator onImageSelect={handleImageGenerated} />
              
              {generatedImage && (
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('edit')}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDirectUse}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Use This Cover
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Fine-tune your book cover using the editor.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('generate')}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
              </div>
              {generatedImage && (
                <ImageEditor
                  initialImageUrl={generatedImage}
                  onSave={handleImageEdited}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};