import React from 'react';
import { Hostel } from '../types';
import { HostelCard } from './HostelCard';

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
    <div className="w-full pb-28 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111C2D] tracking-tight">Saved Hostels & PGs</h1>
          <p className="text-xs sm:text-sm text-[#5C6470] mt-0.5">
            Your shortlisted student accommodations in Pune
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#B8CEAA]">
          {savedHostels.length} {savedHostels.length === 1 ? 'Stay' : 'Stays'} Shortlisted
        </span>
      </div>

      {savedHostels.length === 0 ? (
        <div className="bg-white border border-[#E5E3D8] rounded-2xl p-8 sm:p-12 text-center shadow-xs flex flex-col items-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#F1EFE6] text-[#173B2C] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[34px]">favorite_border</span>
          </div>
          <h3 className="text-lg font-bold text-[#111C2D]">No saved hostels yet</h3>
          <p className="text-xs sm:text-sm text-[#5C6470] max-w-xs mt-1 leading-relaxed">
            Tap the heart icon on any PG or hostel in Kothrud, Hinjewadi, or Viman Nagar to shortlist it here.
          </p>
          <button
            type="button"
            onClick={onNavigateToSearch}
            className="mt-6 px-6 py-3 bg-[#173B2C] hover:bg-[#24523F] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Explore Pune Hostels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {savedHostels.map((hostel) => (
            <HostelCard
              key={hostel.id}
              hostel={hostel}
              onClick={() => onSelectHostel(hostel)}
              isSaved={true}
              onToggleSave={onRemoveSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
