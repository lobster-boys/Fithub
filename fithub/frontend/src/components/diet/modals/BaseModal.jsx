import React, { useEffect } from 'react';

/**
 * 모든 Diet 모달의 기본 컴포넌트
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  subtitle = null,
  children,
  size = 'default', // 'small', 'default', 'large', 'full'
  showCloseButton = true,
  className = '',
  ...props
}) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // 모달 크기별 클래스
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-md';
      case 'large':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-6xl';
      case 'default':
      default:
        return 'max-w-2xl';
    }
  };

  // 배경 클릭으로 모달 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      {...props}
    >
      <div 
        className={`
          bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden
          ${getSizeClasses()}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="모달 닫기"
              >
                <i className="fas fa-times w-6 h-6 text-gray-400"></i>
              </button>
            )}
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="flex flex-col h-full min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal; 