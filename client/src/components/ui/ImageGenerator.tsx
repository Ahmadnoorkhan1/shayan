import { useState, useEffect } from 'react';
import { Loader2, ImageIcon, Plus, XCircle, RefreshCw, LightbulbIcon, Grid, Check } from 'lucide-react';
import { generateImage } from '../../utilities/service/imageService';
import { Button } from './button';
import Tooltip from './tooltip';
import apiService from '../../utilities/service/api';

interface ImageGeneratorProps {
  onImageSelect: (imageUrl: string) => void;
  isEditorContext?: boolean;
  onGenerateStart?: () => void;
  uploadedImage?: string;
  courseId?: string | number;
  contentType?: string;
  NotCover?: boolean
}

interface ApiResponse {
  success: boolean;
  data: any;
  message: string;
}

interface GalleryImage {
  id: string | number;
  filename: string;
  path: string;
  contentType: string;
  contentId: string | number;
  description: string;
  createdAt: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  onImageSelect,
  isEditorContext = false,
  onGenerateStart,
  uploadedImage,
  courseId,
  contentType,
  NotCover = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [promptInputRef, setPromptInputRef] = useState<HTMLTextAreaElement | null>(null);




  useEffect(() => {
    if (uploadedImage) {
      setPrompt('');
      setGeneratedImage(uploadedImage);
    }
  }, [uploadedImage]);

  // Fetch previously generated images when the gallery tab is opened
  useEffect(() => {
    if (!NotCover && showGallery && contentType && courseId) {
      fetchPreviousImages();
    }
  }, [showGallery, contentType, courseId, NotCover]);

  const fetchPreviousImages = async () => {
    if (!contentType || !courseId) {
      setError("Content type or ID not provided");
      return;
    }
    
    try {
      setLoadingGallery(true);
      const response = await apiService.get(`/images/${contentType}/${courseId}`);
      
      if (response?.success && response?.data?.images) {
        // Process images from the correct response structure
        const images = response.data.images;
        setGalleryImages(images);
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setError("Failed to load previous images");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    
    // Notify parent component that generation has started
    if (onGenerateStart) {
      onGenerateStart();
    }

    // Prepare payload for the image generation API
    const payload = {
      prompt: prompt.trim(),
      contentId: courseId || null,
      contentType: contentType || 'general'
    };
  
    try {
      // Pass the structured payload to generateImage
      const response: ApiResponse = await generateImage(payload.prompt, Number(payload.contentId), payload.contentType);
      


if(response.success){
  setGeneratedImage(response.data.url)
  if(!isEditorContext) {
    onImageSelect(response.data.url)
  }
  if (!NotCover && showGallery && contentType && courseId) {
    fetchPreviousImages();
  }
}

    } catch (err) {
      console.error(err);
      setError('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertImage = () => {
    if (generatedImage) {
      onImageSelect(generatedImage);
    } else if (selectedGalleryImage) {
      onImageSelect(selectedGalleryImage);
    }
  };

  const selectGalleryImage = (image: GalleryImage) => {
    // Use the direct URL from the API response
    const fullImageUrl = image.path.startsWith('http') ? image.path : image.filename;
    setSelectedGalleryImage(fullImageUrl);
    setGeneratedImage(fullImageUrl);

    if (!isEditorContext) {
      onImageSelect(fullImageUrl);
    }
  };


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Enter key was pressed without Shift (to allow multiline text with Shift+Enter)
      if (event.key === 'Enter' && !event.shiftKey) {
        // Check if the prompt field is focused and has content
        if (
          document.activeElement === promptInputRef && 
          prompt.trim() && 
          !loading
        ) {
          event.preventDefault(); // Prevent newline in textarea
          handleGenerate();
        }
      }
    };
  
    // Add event listener
    if (promptInputRef) {
      promptInputRef.addEventListener('keydown', handleKeyPress);
    }
  
    // Clean up
    return () => {
      if (promptInputRef) {
        promptInputRef.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [promptInputRef, prompt, loading, handleGenerate]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
      {/* Only show gallery tabs if NotCover is false */}
      {!NotCover && (
        <div className="px-6 pt-4 pb-2 border-b border-purple-100">
          <div className="flex gap-4">
            <button
              onClick={() => setShowGallery(false)}
              className={`px-4 py-2 rounded-md font-medium ${
                !showGallery 
                  ? "bg-purple-100 text-purple-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Generate New
            </button>
            <button
              onClick={() => setShowGallery(true)}
              className={`px-4 py-2 rounded-md font-medium ${
                showGallery 
                  ? "bg-purple-100 text-purple-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Image Gallery
            </button>
          </div>
        </div>
      )}

      {/* Show generator if NotCover is true or if gallery is not selected */}
      {(NotCover || !showGallery) ? (
        // Generate Image Section
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Input */}
          <div className="flex-1 p-6 border-r border-purple-100">
            <div className="space-y-4">
            <textarea
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  ref={(el) => setPromptInputRef(el)}
  placeholder="Describe the image you want to create... (e.g., 'A magical castle under a starry night sky')"
  className="w-full p-4 text-sm border border-purple-200 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-purple-500/30 
           focus:border-purple-500 min-h-[120px] resize-none
           bg-purple-50/30"
/>

<p className="text-xs text-gray-500 mt-1">
  Press Enter to generate, or Shift+Enter for a new line
</p>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  variant='outline'
                  className="btn-primary w-full flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-md
                  shadow-lg hover:shadow-xl
                  transform transition-all duration-200 hover:-translate-y-0.5 text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                  ) : (
                    <><ImageIcon className="w-5 h-5" /> Generate Image</>
                  )}
                </Button>
                
                {generatedImage && (
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="px-4 rounded-lg border border-purple-200 
                             hover:bg-purple-50 transition-colors"
                    title="Generate New Image"
                  >
                    <Tooltip width="auto" content="Start over with a new image">
                      <RefreshCw className="w-5 h-5 text-gray-700" />
                    </Tooltip>
                  </button>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 
                              border border-red-200 rounded-lg animate-fadeIn">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Tips Section - Integrated */}
              <div className="mt-6 pt-6 border-t border-purple-100">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <LightbulbIcon className="w-4 h-4 text-gray-700" />
                  <h4 className="font-medium">Tips for better results:</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1.5 pl-5">
                  <li>• Be specific about the style (e.g., watercolor, digital art)</li>
                  <li>• Include details about lighting and mood</li>
                  <li>• Specify the perspective or composition</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Section - Preview */}
          <div className="flex-1 p-6 bg-purple-50/30">
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex justify-between">
                <span>Preview</span>
                {/* Always show insert button when in editor context and an image is available */}
                {isEditorContext && generatedImage && (
                  <button
                    onClick={handleInsertImage}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Insert
                  </button>
                )}
              </h3>
              
              {generatedImage ? (
                <div className={`relative rounded-xl overflow-hidden flex-1 ${
                  isEditorContext ? '' : 'group'
                }`}>
                  <img 
                    src={generatedImage} 
                    alt="AI Generated" 
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300"
                    onError={(e) => {
                      // const target = e.target as HTMLImageElement;
                      // target.src = '/placeholder-image.png';
                      setError('Failed to load generated image');
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 rounded-xl border-2 border-dashed 
                              border-purple-200 flex items-center justify-center">
                  <p className="text-gray-700 text-sm">
                    Generated image will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Gallery Section - Only shown if NotCover is false
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Previously Generated Images</h3>
            <button
              onClick={fetchPreviousImages}
              className="p-2 rounded-full hover:bg-purple-50"
              title="Refresh Gallery"
            >
              <RefreshCw className={`w-4 h-4 text-purple-600 ${loadingGallery ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingGallery ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Grid className="w-12 h-12 mb-3 text-gray-300" />
              <p>No images found. Generate your first image!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages?.map((image) => {
                  // Use the direct URL
                  const fullImageUrl = image.path.startsWith('http') ? image.path : image.filename;
                  return (
                    <div 
                      key={image.id}
                      className={`
                        relative rounded-lg overflow-hidden cursor-pointer h-40
                        border-2 ${selectedGalleryImage === fullImageUrl ? 'border-purple-500' : 'border-transparent'} 
                        transition-all hover:shadow-md
                      `}
                      onClick={() => selectGalleryImage(image)}
                    >
                      <img 
                        src={fullImageUrl} 
                        alt={image.description || "Generated image"} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png';
                        }}
                      />
                      {selectedGalleryImage === fullImageUrl && (
                        <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <Tooltip content={image.description || "Generated image"} width="medium">
                          <p className="text-white text-xs truncate">
                            {image.description ? image.description.substring(0, 40) + '...' : "AI Image"}
                          </p>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isEditorContext && selectedGalleryImage && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleInsertImage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Selected Image
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;