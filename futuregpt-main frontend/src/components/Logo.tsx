import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`${sizeClasses[size]} rounded-md bg-gray-900 border border-gray-700/60 flex items-center justify-center`}> 
        <span className="text-green-400 font-semibold text-[10px]">ZT</span>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold text-white/90`}>
          zeroTrace
        </span>
      )}
    </div>
  );
}