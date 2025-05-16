import React from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-opacity-90',
  secondary: 'bg-white text-primary border border-primary hover:bg-orange-50',
  outline: 'bg-transparent border border-gray-300 hover:border-primary hover:text-primary',
  text: 'bg-transparent text-primary hover:underline',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-lg',
  lg: 'text-base px-6 py-3 rounded-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 