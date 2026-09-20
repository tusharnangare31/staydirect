import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  badgeText?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'text-[#111C2D]',
  subtextColor = 'text-[#5C6470]',
  badgeText = '₹0 Brokerage',
  className = '',
}) => {
  const sizeMap = {
    xs: { img: 'w-6 h-6', rounded: 'rounded-lg', title: 'text-sm', sub: 'text-[9px]' },
    sm: { img: 'w-8 h-8', rounded: 'rounded-xl', title: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-10 h-10', rounded: 'rounded-xl', title: 'text-lg', sub: 'text-[11px]' },
    lg: { img: 'w-12 h-12', rounded: 'rounded-2xl', title: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', rounded: 'rounded-3xl', title: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Custom SVG Logo Icon */}
      <div
        className={`${currentSize.img} ${currentSize.rounded} overflow-hidden shadow-xs shrink-0 flex items-center justify-center transition-transform group-hover:scale-105`}
      >
        <img
          src="/icon.svg"
          alt="StayDirect Custom Logo"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-black ${currentSize.title} ${textColor} tracking-tight leading-none`}>
              Stay<span className="text-[#173B2C]">Direct</span>
            </span>
            {badgeText && (
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#B8CEAA] tracking-wider leading-none">
                {badgeText}
              </span>
            )}
          </div>
          <span className={`font-medium ${currentSize.sub} ${subtextColor} mt-0.5 tracking-tight`}>
            Pune Student Housing • Direct Owners
          </span>
        </div>
      )}
    </div>
  );
};
