import React from 'react';
import { cn } from '@/lib/utils';

interface ChineseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ChineseButton: React.FC<ChineseButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = "relative overflow-hidden transition-all duration-300 font-medium border-2 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600 focus:ring-amber-400 shadow-lg hover:shadow-xl",
    outline: "bg-transparent hover:bg-red-50 text-red-600 border-red-600 hover:border-red-700 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-red-50 text-red-600 border-transparent hover:border-red-200 focus:ring-red-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default ChineseButton;
