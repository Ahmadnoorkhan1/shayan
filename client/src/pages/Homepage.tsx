import HeroSection from '../components/HeroSection'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Layers, Upload } from 'lucide-react'
import apiService from '../utilities/service/api'
import FileUploader from '../components/FileUploader'

const Homepage = () => {
    const {token} = useParams();
    useEffect(()=>{
       if(!token){
        //    window.location.href="https://minilessonsacademy.com/react-access.php"
       }
    
    },[])
const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  const handleFileUploadSuccess = (fileUrl: string) => {
    setUploadedFiles(prev => [...prev, fileUrl]);
    console.log('File uploaded successfully:', fileUrl);
  }

  const handleFileUploadError = (error: any) => {
    console.error('Upload error:', error);
    setError(error.message || 'An error occurred during file upload');
  }

  const toggleUploader = () => {
    setShowUploader(prev => !prev);
  }

    const handleRedirect = async () => {
        setIsLoading(true);
        setError(null);
        setStatus('Initializing token generation...');
        console.log('second')
        
        try {
          // Step 1: Request preparation
          setStatus('Preparing request...');
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Step 2: Sending request to server
          setStatus('Generating secure access token...');
          const userId = 1
          const response = await apiService.post('/auth/generate-access-token', { 
            userId,
            destinationPath:'/'
          });
    
          console.log('[AccessTokenRedirect] Response:', response);
          
          // Step 3: Analyzing response
          setStatus('Processing server response...');
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (response.success && response?.redirectUrl) {
            // Step 4: Preparing redirect
            setStatus('Access granted! Redirecting...');
            
            // Redirect user to the external app with the token
            setTimeout(() => {
              window.location.href = response.redirectUrl;
            }, 800);
          } else {
            setError(response.message || 'Failed to generate access token');
            setStatus('');
          }
        } catch (err: any) {
          console.error('[AccessTokenRedirect] Error:', err);
          setError(err.message || 'An error occurred while generating access token');
          setStatus('');
        } finally {
          // Only set loading to false if we had an error (otherwise we're redirecting)
          if (error) {
            setIsLoading(false);
          }
        }
      };

    return (
        <>
            <HeroSection></HeroSection>
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative w-full max-w-2xl mx-auto text-center px-6 h-screen">
        {/* Floating papers animation - keeping this animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${6 + Math.random() * 10}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.1 + Math.random() * 0.2,
              }}
            >
              <div
                className="w-16 h-20 bg-purple-200 rounded-sm"
                style={{
                  transform: `rotate(${Math.random() * 30 - 15}deg)`,
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Main content - without animations */}
        <div className="relative h-[100vh] flex justify-center items-center  z-10">
          <div className="mb-8 flex flex-col items-center relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-purple-600 blur-xl opacity-20"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-800 rounded-full 
                  flex items-center justify-center mb-8" onClick={()=> handleRedirect()}>
                <Layers className="w-16 h-16 text-white" />
              </div>
              
              {/* File Upload Test Section */}
              {/* <div className="mt-12 w-full max-w-md">
                <button 
                  onClick={toggleUploader}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
                  text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mx-auto"
                >
                  <Upload size={18} />
                  {showUploader ? 'Hide File Uploader' : 'Test File Upload'}
                </button>
                
                {showUploader && (
                  <div className="mt-4 p-6 bg-white rounded-lg shadow-lg border border-purple-100">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800">Cloudflare R2 File Upload Test</h3>
                    
                    <FileUploader 
                      onUploadSuccess={handleFileUploadSuccess}
                      onUploadError={handleFileUploadError}
                      folderPath="test-uploads"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                    />
                    
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                      </div>
                    )}
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-purple-800">Successfully Uploaded:</h4>
                        <ul className="mt-2 space-y-1 text-left">
                          {uploadedFiles.map((url, index) => (
                            <li key={index} className="text-sm">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                {url.split('/').pop()}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div> */}
          </div>
        </div>
      </div>
    </div>
        </>
    )
}

export default Homepage