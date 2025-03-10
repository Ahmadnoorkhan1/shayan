import { useState } from 'react';
import { Loader2, ImageIcon, Plus, XCircle, Wand2, RefreshCw, LightbulbIcon } from 'lucide-react';
import { generateImage } from '../../utilities/service/imageService';

interface ImageGeneratorProps {
  onImageSelect: (imageUrl: string) => void;
}

interface ApiResponse {
  success: boolean;
  data: string;
  message: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageSelect }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse = await generateImage(prompt);
      if (response.success) {
        // setGeneratedImage(response.data);
// const Url = 'http://dev.minilessonsacademy.com'
const Url = 'https://minilessonsacademy.onrender.com'

        const imageUrl = `${Url}${response.data}`;
        setGeneratedImage(imageUrl);

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
      {/* Header */}
      {/* <div className="border-b border-purple-100 p-4 bg-purple-50/50">
        <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          AI Image Generator
        </h3>
      </div> */}

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
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex-1 py-3 px-5 bg-purple-600 text-white rounded-lg 
                         hover:bg-purple-700 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-all 
                         flex items-center justify-center gap-2 
                         shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                  <><ImageIcon className="w-5 h-5" /> Generate Image</>
                )}
              </button>
              
              {generatedImage && (
                <button
                  onClick={() => setGeneratedImage(null)}
                  className="px-4 rounded-lg border border-purple-200 
                           hover:bg-purple-50 transition-colors"
                  title="Generate New Image"
                >
                  <RefreshCw className="w-5 h-5 text-purple-600" />
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
              <div className="flex items-center gap-2 text-purple-900 mb-3">
                <LightbulbIcon className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium">Tips for better results:</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-1.5 pl-5">
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
            <h3 className="text-sm font-medium text-purple-900 mb-4">
              Preview
            </h3>
            
            {generatedImage ? (
              <div className="relative group rounded-xl overflow-hidden flex-1">
                <img 
                  src={generatedImage} 
                  alt="AI Generated" 
                  className="w-full h-full object-cover rounded-lg 
                           transition-transform duration-300 
                           group-hover:scale-[1.02]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                    setError('Failed to load generated image');
                  }}
                />
                <div className="absolute inset-0 bg-purple-900/80 opacity-0 
                              group-hover:opacity-100 transition-all duration-300 
                              flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={handleInsertImage}
                    className="px-6 py-3 bg-white text-purple-900 rounded-lg 
                             hover:bg-purple-50 transition-colors 
                             flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Insert Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-xl border-2 border-dashed 
                            border-purple-200 flex items-center justify-center">
                <p className="text-purple-400 text-sm">
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