import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../../ui/button';
import { Book, ImageIcon, Edit2, CheckCircle, Upload, RefreshCw } from 'lucide-react';
import Modal from '../../ui/Modal';
import ImageGenerator from '../../ui/ImageGenerator';
import ImageEditor from '../../ui/ImageEditor/ImageEditor';
import toast from 'react-hot-toast';

interface GenerateCoverProps {
  onCoverImageGenerated?: (imageUrl: string) => void;
}

export const GenerateCover: React.FC<GenerateCoverProps> = ({ onCoverImageGenerated }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'generate' | 'edit'>('generate');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the current image (either generated or uploaded)
  const currentImage = uploadedImage || generatedImage;

  // Use useCallback to ensure this function maintains reference stability
  const handleImageGenerated = useCallback((imageUrl: string) => {
    console.log("Image generated:", imageUrl); // Debug log
    setGeneratedImage(imageUrl);
    setUploadedImage(null);
    setIsGenerating(false);
    setShowImagePreview(true);
  }, []);

  const handleDirectUse = () => {
    if (currentImage && onCoverImageGenerated) {
      onCoverImageGenerated(currentImage);
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
    setUploadedImage(null);
    setIsGenerating(false);
    setShowImagePreview(false);
  };

  // Track when generation starts
  const handleGenerationStart = useCallback(() => {
    console.log("Generation started"); // Debug log
    setIsGenerating(true);
    setShowImagePreview(false);
  }, []);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;

    if(file?.size > 3000000) {
      toast.error("File size exceeds 3MB. Please upload a smaller file.");
      return;
    }

    if (file) {

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setGeneratedImage(null);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle generating new image
  const handleGenerateNew = () => {
    setShowImagePreview(false);
    setGeneratedImage(null);
    setUploadedImage(null);
  };

  return (
    <>
    <div className='text-purple-600'>
      <Button 
        variant="soft"
        size='sm'
        onClick={() => setShowModal(true)}
        className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
        >
        <Book className="w-4 h-4 " />
        <span className="text-[12px] ">Book Cover</span>
      </Button>
      </div>

      {/* Hidden file input for upload */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple={false}
        onChange={handleFileChange}
      />

      <Modal 
        isOpen={showModal}
        onClose={handleClose}
        title={currentStep === 'generate' ? "Generate Book Cover" : "Edit Book Cover"}
      >
        <div className="flex flex-col gap-4">
          {currentStep === 'generate' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Generate a cover image for your book using AI or upload your own.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileUpload}
                  className="flex items-center gap-1 btn-outline-primary"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>

             

                <ImageGenerator 
                  onImageSelect={handleImageGenerated} 
                  onGenerateStart={handleGenerationStart}
                  isEditorContext={false}
                  uploadedImage={uploadedImage as any}
                />
              
              {/* Action buttons */}
              <div className="flex justify-between gap-3 mt-4 pt-4 border-t">
                <div>
                
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('edit')}
                    className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 hover:-translate-y-0.5 text-base"                    disabled={!currentImage || isGenerating}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Image
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleDirectUse}
                    className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 hover:-translate-y-0.5 text-base"                    disabled={!currentImage || isGenerating}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 btn-primary" />
                    Use This Cover
                  </Button>
                </div>
              </div>
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
                  <ImageIcon className="w-4 h-4 mr-2 btn-outline-primary" />
                  Back to Generator
                </Button>
              </div>
              {currentImage && (
                <ImageEditor
                  initialImageUrl={currentImage}
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