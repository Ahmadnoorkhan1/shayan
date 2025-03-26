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
  confirmStyle?: 'outline' | 'soft' | 'primary' | 'danger';
  onCancel?: () => void;
  cancelStyle?: 'outline' | 'primary' | 'danger';
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
  confirmStyle = 'primary',
  onCancel,
  cancelStyle = 'outline'
}) => {
  if (!isOpen) return null;

  const getButtonStyles = (style: string | undefined) => {
    switch (style) {
      case 'outline':
        return 'border border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'soft':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'primary':
      default:
        return 'bg-purple-600 text-white hover:bg-purple-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-purple-800">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
          )}
          
          {children}
          
          {showImage && imageUrl && (
            <div className="my-4 border rounded-md p-2 bg-gray-50">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-52 w-full mx-auto object-contain rounded"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className={`min-w-[100px] px-4 py-2 rounded-md transition-colors ${getButtonStyles(cancelStyle)}`}
            >
              {cancelText}
            </button>
          )}
          
          {/* Close/Continue button */}
          <button
            onClick={onClose}
            className="min-w-[100px] px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {onCancel ? "Continue Editing" : cancelText}
          </button>
          
          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className={`min-w-[100px] px-4 py-2 rounded-md transition-colors ${getButtonStyles(confirmStyle)}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;