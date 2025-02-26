import { useState } from 'react';
import { Loader2, ImageIcon, Plus, XCircle } from 'lucide-react';
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
      console.log(response, "response");
      if (response.success) {
        setGeneratedImage(response.data);
      } else {
        setError(response.message || 'Failed to generate image');
      }
    } catch (err: any) {
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
    console.log("Insert Image");
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl p-6 space-y-6 border border-purple-200">
      {/* ... existing header ... */}

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="w-full p-3 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 min-h-[100px] resize-none bg-white/80 backdrop-blur-md"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 px-5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><ImageIcon className="w-5 h-5" /> Generate Image</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {generatedImage && (
          <div className="relative group rounded-lg overflow-hidden shadow-lg">
            <img 
              src={generatedImage} 
              alt="AI Generated" 
              className="w-full h-56 object-cover transition-transform transform group-hover:scale-105 duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.png'; // Add a placeholder image
                setError('Failed to load generated image');
              }}
            />
            <div className="absolute inset-0 bg-purple-700/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white backdrop-blur-sm">
              <button
                onClick={handleInsertImage}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Insert into Editor
              </button>
              <p className="text-xs opacity-75">Click to insert the image into your content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;