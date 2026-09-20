import React from 'react';
import { Hostel } from '../types';
import { formatIndianRupees } from '../theme';

interface HostelCardProps {
  hostel: Hostel;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  recommendationReason?: string;
  className?: string;
}

export const HostelCard: React.FC<HostelCardProps> = ({
  hostel,
  onClick,
  isSaved = false,
  onToggleSave,
  recommendationReason,
  className = '',
}) => {
  // Total available beds calculation
  const totalAvailableBeds = hostel.occupancies?.reduce((sum, occ) => sum + (occ.left || 0), 0) ?? 3;

  // Gender badge styling matching React Native HostelCard
  const getGenderBadge = () => {
    switch (hostel.gender) {
      case 'Girls':
        return {
          bg: 'bg-[#BE185D]',
          text: 'GIRLS',
        };
      case 'Boys':
        return {
          bg: 'bg-[#2B5B84]',
          text: 'BOYS',
        };
      default:
        return {
          bg: 'bg-[#4A7C59]',
          text: 'CO-ED',
        };
    }
  };

  const genderStyle = getGenderBadge();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E5E3D8] hover:border-[#173B2C]/40 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col ${className}`}
    >
      {/* 1. Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#E2E8F0]">
        <img
          src={hostel.imageUrl}
          alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top-Left Badges Strip matching React Native */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {/* Zero Brokerage Badge */}
          <span className="bg-[#0F766E] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            ₹0 BROKERAGE
          </span>

          {/* Gender Badge */}
          <span
            className={`${genderStyle.bg} text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase`}
          >
            {genderStyle.text}
          </span>
        </div>

        {/* Top-Right Favorite Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(hostel.id);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-red-500 shadow-sm transition-transform active:scale-90 z-10"
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                color: isSaved ? '#EF4444' : '#64748B',
                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
          </button>
        )}

        {/* Bottom Recommendation Reason Banner (if provided) */}
        {recommendationReason ? (
          <div className="absolute bottom-2 left-2.5 right-2.5 bg-[#0D231A]/90 backdrop-blur-sm text-[#DDE9D5] text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm truncate">
            <span className="material-symbols-outlined text-[#D4A373] text-[14px]">auto_awesome</span>
            <span className="truncate">{recommendationReason}</span>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2.5 text-[11px] font-bold text-white drop-shadow-md bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
            Direct Owner Listing
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Location & Verified Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[#5C6470] text-xs font-semibold truncate">
              <span className="material-symbols-outlined text-[#173B2C] text-[16px] shrink-0">
                location_on
              </span>
              <span className="truncate">{hostel.area}, Pune</span>
            </div>

            {hostel.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded shrink-0">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                Verified
              </span>
            )}
          </div>

          {/* Hostel Name */}
          <h3 className="font-bold text-base text-[#111C2D] group-hover:text-[#173B2C] transition-colors line-clamp-1 leading-snug">
            {hostel.name}
          </h3>

          {/* Rating & Response Time */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#15803D] text-white px-1.5 py-0.5 rounded font-bold text-[11px] shrink-0">
              <span className="material-symbols-outlined text-[13px]">star</span>
              <span>{hostel.rating.toFixed(1)}</span>
              <span className="text-white/80 font-normal">({hostel.reviewCount})</span>
            </div>

            <span className="text-gray-300">•</span>

            <span className="text-[#0284C7] bg-[#E0F2FE] text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              {hostel.owner?.responseTime ? 'Replies < 15m' : 'Fast response'}
            </span>
          </div>

          {/* Room Type & College Proximity */}
          <div className="flex items-center gap-1.5 text-xs text-[#5C6470] font-medium pt-0.5">
            <span className="material-symbols-outlined text-[15px] text-[#173B2C] shrink-0">
              bed
            </span>
            <span className="font-semibold text-[#111C2D] truncate">
              {hostel.roomTypeTag || 'Single & Sharing'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="truncate text-gray-500">
              {hostel.distanceTag || 'Near College Hub'}
            </span>
          </div>

          {/* Amenities Chips */}
          <div className="flex items-center gap-1.5 overflow-hidden pt-1">
            {hostel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold text-[#475569] bg-[#F1EFE6] px-2 py-0.5 rounded text-nowrap truncate max-w-[110px]"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Bottom Strip: Starting Rent & Bed Vacancy */}
        <div className="pt-2.5 border-t border-[#ECEAE2] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] text-[#8E95A2] font-semibold uppercase tracking-wider block">
              Starting rent
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-[#111C2D]">
                {formatIndianRupees(hostel.monthlyRent)}
              </span>
              <span className="text-xs text-[#5C6470] font-medium">/mo</span>
            </div>
          </div>

          {totalAvailableBeds > 0 ? (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              <span>{totalAvailableBeds} beds available</span>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full shrink-0">
              Filling fast
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
