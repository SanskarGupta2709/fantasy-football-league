import React from 'react';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  logo: string;
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  teamName,
  size = 'md',
  className,
  showTooltip = false
}) => {
  const isImageLogo = logo && (logo.includes('.png') || logo.includes('.jpg') || logo.includes('.jpeg') || logo.includes('.gif') || logo.startsWith('http') || logo.startsWith('/'));

  return (
    <div 
      className={cn(
        "flex items-center justify-center shrink-0 relative group",
        sizeClasses[size],
        className
      )}
      title={showTooltip ? teamName : undefined}
    >
      {isImageLogo ? (
        <>
          <img 
            src={logo} 
            alt={`${teamName} logo`}
            className={cn(
              "object-cover rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
              sizeClasses[size]
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className={cn(
            "hidden rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200",
            sizeClasses[size],
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
          )}>
            ⚽
          </div>
        </>
      ) : (
        <div className={cn(
          "rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
          sizeClasses[size],
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
        )}>
          {logo || '⚽'}
        </div>
      )}
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {teamName}
        </div>
      )}
    </div>
  );
};