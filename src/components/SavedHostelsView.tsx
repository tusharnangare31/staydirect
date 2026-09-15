import React from 'react';
import { Hostel } from '../types';

interface SavedHostelsViewProps {
  savedHostels: Hostel[];
  onSelectHostel: (hostel: Hostel) => void;
  onRemoveSave: (id: string) => void;
  onNavigateToSearch: () => void;
}

export const SavedHostelsView: React.FC<SavedHostelsViewProps> = ({
  savedHostels,
  onSelectHostel,
  onRemoveSave,
  onNavigateToSearch,
}) => {
  return (
    <div className="flex flex-col w-full pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">Saved Hostels</h1>
          <p className="text-xs text-[#404945]">Your bookmarked places in Pune</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#E8F5EE] text-[#006C49] text-xs font-bold border border-[#B4EFDA]">
          {savedHostels.length} Places
        </span>
      </div>

      {savedHostels.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center shadow-xs flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#F0F3FF] text-[#00362A] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
          </div>
          <h3 className="text-base font-bold text-[#111C2D]">No saved hostels yet</h3>
          <p className="text-xs text-[#404945] max-w-xs mt-1">
            Tap the heart icon on any PG or hostel in Hinjewadi, Kothrud, or Viman Nagar to save it
            here.
          </p>
          <button
            type="button"
            onClick={onNavigateToSearch}
            className="mt-4 px-5 py-2.5 bg-[#00362A] text-white rounded-xl text-xs font-bold hover:bg-[#124E3F] transition-all shadow-xs"
          >
            Browse Hostels in Pune
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedHostels.map((hostel) => (
            <div
              key={hostel.id}
              onClick={() => onSelectHostel(hostel)}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-xs flex gap-3 cursor-pointer hover:shadow-md transition-shadow relative"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#DEE8FF] shrink-0 relative">
                <img
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1 rounded">
                  {hostel.gender}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-xs font-bold text-[#111C2D] truncate">{hostel.name}</h3>
                    <button
                      type="button"
                      aria-label="Remove from saved"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSave(hostel.id);
                      }}
                      className="text-[#BA1A1A] p-0.5 hover:scale-110 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#404945] truncate mt-0.5">{hostel.fullAddress}</p>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-[#F0F3FF]">
                  <span className="text-xs font-extrabold text-[#00362A]">
                    ₹{hostel.monthlyRent.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-[#707975] font-normal">/mo</span>
                  </span>
                  <span className="text-[10px] text-[#006C49] font-bold">0% Brokerage</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
