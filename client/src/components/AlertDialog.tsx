import React from "react";
import { Button } from "./ui/button";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  showImage?: boolean;
  imageUrl?: string;
  confirmStyle?: 'outline' | 'soft';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showImage = false,
  imageUrl = "",
  confirmStyle = 'default'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-purple-800">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-4">
          {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
          
          {children}
          
          {showImage && imageUrl && (
            <div className="my-4 border rounded-md p-2 bg-gray-50">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-52 mx-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t flex justify-end gap-3">
          <Button
            type="button"
            variant="soft"
            className='btn-primary'  
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant={confirmStyle === 'outline' ? 'outline' : 'soft'}
            className='btn-primary'  
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;