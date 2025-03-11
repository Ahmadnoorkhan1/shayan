import { useState } from 'react';
import { Loader2, ImageIcon, Plus, XCircle, RefreshCw, LightbulbIcon } from 'lucide-react';
import { generateImage } from '../../utilities/service/imageService';
import { Button } from './button';

interface ImageGeneratorProps {
  onImageSelect: (imageUrl: string) => void;
  isEditorContext?: boolean;
  // New prop to notify when generation starts
  onGenerateStart?: () => void;
}

interface ApiResponse {
  success: boolean;
  data: string;
  message: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  onImageSelect,
  isEditorContext = false,
  onGenerateStart
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);


  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    
    // Notify parent component that generation has started
    if (onGenerateStart) {
      console.log("Calling onGenerateStart");
      onGenerateStart();
    }
  
    try {
      const response: ApiResponse = await generateImage(prompt);
      if (response.success) {
        const Url = `http://localhost:5002`;
        const imageUrl = `${Url}${response.data}`;
        setGeneratedImage(imageUrl);
        
        // Immediately call the onImageSelect callback when image is available
        onImageSelect(imageUrl);
        console.log("Image generated and callback called");
      } else {
        setError(response.message || 'Failed to generate image');
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
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left Section - Input */}
        <div className="flex-1 p-6 border-r border-purple-100">
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create... (e.g., 'A magical castle under a starry night sky')"
              className="w-full p-4 text-sm border border-purple-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30 
                       focus:border-purple-500 min-h-[120px] resize-none
                       bg-purple-50/30"
            />

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                variant='outline'
                className = "btn-primary w-full"
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
                  <RefreshCw className="w-5 h-5 text-gray-700" />
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
                // Apply hover effects only when not in editor context
                isEditorContext ? '' : 'group'
              }`}>
                <img 
                  src={generatedImage} 
                  alt="AI Generated" 
                  className="w-full h-full object-cover rounded-lg transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
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
    </div>
  );
};

export default ImageGenerator;