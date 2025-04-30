import React, { useState, useRef } from 'react';
import axios from 'axios';
import apiService from '../utilities/service/api';

interface FileUploaderProps {
  onUploadSuccess?: (fileUrl: string) => void;
  onUploadError?: (error: any) => void;
  folderPath?: string;
  allowMultiple?: boolean;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string; // MIME types
  buttonText?: string;
  className?: string;
}

interface UploadedFile {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  folderPath = '',
  allowMultiple = false,
  maxFileSize = 10, // Default 10MB
  acceptedFileTypes = '*/*',
  buttonText = 'Upload File',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check file size
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxFileSize * 1024 * 1024) {
        setError(`File ${files[i].name} exceeds the maximum size of ${maxFileSize}MB`);
        onUploadError && onUploadError({ message: `File size exceeds ${maxFileSize}MB` });
        return;
      }
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    
    // Append files to form data
    if (allowMultiple) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('file', files[0]);
    }
    
    // Add folder path if provided
    if (folderPath) {
      formData.append('folder', folderPath);
    }

    try {
      const endpoint = allowMultiple ? 'http:localhost:5002/api/files/upload-multiple' : 'http:localhost:5002/api/files/upload-multiple/api/files/upload';
      
      const response:any = apiService.post('files/upload',
        formData
      )

      if (response.data.success) {
        if (allowMultiple) {
          const uploadedFiles = response.data.data.files;
          setUploadedFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
          
          // Notify parent component about successful upload
          uploadedFiles.forEach((file: UploadedFile) => {
            onUploadSuccess && onUploadSuccess(file.url);
          });
        } else {
          const fileData = response.data.data;
          setUploadedFiles(prevFiles => [...prevFiles, fileData]);
          
          // Notify parent component about successful upload
          onUploadSuccess && onUploadSuccess(fileData.url);
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'An error occurred during upload');
      onUploadError && onUploadError(error);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple={allowMultiple}
        accept={acceptedFileTypes}
      />
      
      <button
        onClick={handleFileSelect}
        className={`upload-button ${className}`}
        disabled={isUploading}
      >
        {isUploading ? `Uploading... ${progress}%` : buttonText}
      </button>
      
      {error && <div className="upload-error">{error}</div>}
      
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files:</h4>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.originalName}
                </a>
                {' '}- {(file.size / 1024).toFixed(2)} KB
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 