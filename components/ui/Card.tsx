import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  hover = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 border';
  // New "Friendly" styles: White background, soft slate border, clean shadow
  const themeStyles = 'bg-white border-slate-100 shadow-sm';
  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${themeStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
