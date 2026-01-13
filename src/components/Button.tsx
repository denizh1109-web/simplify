import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'default' | 'pill';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  rounded = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'btn transition-all duration-300';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const roundedClasses = {
    default: 'rounded-inner',
    pill: 'btn-pill',
  };

  return (
    <button 
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
