import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm overflow-hidden
        ${hover ? 'hover:shadow-md transition-shadow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 