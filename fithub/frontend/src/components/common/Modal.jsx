import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  title,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const modalSize = sizes[size] || sizes.md;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`
            bg-white rounded-xl shadow-lg transform transition-all fade-in
            ${modalSize} w-full relative
            ${className}
          `}
        >
          {title && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium">{title}</h3>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className={!title ? 'pt-4' : ''}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 