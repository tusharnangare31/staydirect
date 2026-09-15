import React, { useState } from 'react';
import { Hostel, Area } from '../types';

interface StudentHomeViewProps {
  hostels: Hostel[];
  areas: Area[];
  savedHostelIds: Set<string>;
  onToggleSave: (id: string) => void;
  onSelectHostel: (hostel: Hostel) => void;
  onSelectArea: (areaName: string) => void;
  onNavigateToSearch: (query?: string, category?: string) => void;
  onOpenDirectChat: (hostel: Hostel) => void;
  onOpenFilter: () => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  hostels,
  areas,
  savedHostelIds,
  onToggleSave,
  onSelectHostel,
  onSelectArea,
  onNavigateToSearch,
  onOpenDirectChat,
  onOpenFilter,
}) => {
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const handlePillClick = (filterType: string) => {
    if (selectedPill === filterType) {
      setSelectedPill(null);
    } else {
      setSelectedPill(filterType);
      onNavigateToSearch('', filterType);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToSearch(searchInput);
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-24">
      {/* Greeting Header Section */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[20px] font-bold text-[#111C2D] tracking-tight">
              Hello, Student!
            </h1>
            <span className="text-xl animate-bounce">👋</span>
          </div>
          <p className="text-[13px] text-[#404945] mt-0.5">
            Find your perfect hostel in Pune
          </p>
        </div>

        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#DEE8FF] overflow-hidden shadow-xs flex items-center justify-center p-0.5 ring-2 ring-[#B4EFDA]/60">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvZgbPa_ovWnFYtRM2V2ETPgVe__fVKmbQGvcBMUFW8346ltYVyoGTNXiMKDHCPAVH6g9peeSZWJPUUjR8md_blLZxnG9w5hD5J4pakjz1mKRyZKeCfWSiKWJdnLQx4oQWYaMfcRlY-c0TsdgiaNL20iBgXI8DWUMaHN8lH_hoCK1p1QyGzqeHYXvyV-k9oMuWv67EtralAJbFmhuHVHsK9GxFEGwxuSq0T9NCn-ehj4rHJFdy3OaJ"
              alt="Rahul Sharma"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] rounded-full ring-2 ring-white" />
        </div>
      </section>

      {/* Search Input Bar */}
      <section className="w-full">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center w-full bg-white rounded-xl shadow-[0_4px_18px_rgba(0,54,42,0.05)] px-4 py-3 group transition-all duration-200 border border-[#E2E8F0]/70 focus-within:border-[#006C49] focus-within:shadow-[0_4px_20px_rgba(0,108,73,0.12)]"
        >
          <span className="material-symbols-outlined text-[#707975] group-focus-within:text-[#00362A] transition-colors text-[22px] shrink-0">
            search
          </span>
          <input
            id="hostel-search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search areas, colleges, or hostels..."
            className="w-full bg-transparent border-0 outline-none text-[#111C2D] placeholder:text-[#707975] text-sm pl-3 pr-2 min-w-0"
          />
          <button
            type="button"
            onClick={onOpenFilter}
            aria-label="Filter Options"
            className="w-8 h-8 rounded-lg bg-[#F0F3FF] flex items-center justify-center text-[#00362A] hover:bg-[#DEE8FF] active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </form>
      </section>

      {/* Trust & Zero Brokerage Bannerette */}
      <section className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#6CF8BB]/25 border border-[#6CF8BB]/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#006C49] flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[14px]">verified</span>
          </div>
          <span className="text-[11px] font-semibold text-[#00714D] truncate">
            Zero Brokerage • 100% Verified Properties
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#006C49] shrink-0 ml-1">
          Direct Connect
        </span>
      </section>

      {/* Quick Filter Pill Category Buttons */}
      <section className="w-full">
        <div className="grid grid-cols-4 gap-2.5">
          {/* Near Colleges */}
          <button
            type="button"
            onClick={() => handlePillClick('colleges')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-center gap-1.5 ${
              selectedPill === 'colleges'
                ? 'bg-[#00362A] text-white shadow-md'
                : 'bg-white text-[#111C2D] hover:bg-[#F0F3FF]'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                selectedPill === 'colleges'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#B4EFDA]/50 text-[#00362A]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <span className="text-[11px] font-semibold truncate w-full">Colleges</span>
          </button>

          {/* PG */}
          <button
            type="button"
            onClick={() => handlePillClick('pg')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-center gap-1.5 ${
              selectedPill === 'pg'
                ? 'bg-[#00362A] text-white shadow-md'
                : 'bg-white text-[#111C2D] hover:bg-[#F0F3FF]'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                selectedPill === 'pg'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#6CF8BB]/40 text-[#006C49]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">apartment</span>
            </div>
            <span className="text-[11px] font-semibold truncate w-full">PG</span>
          </button>

          {/* Boys */}
          <button
            type="button"
            onClick={() => handlePillClick('boys')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-center gap-1.5 ${
              selectedPill === 'boys'
                ? 'bg-[#00362A] text-white shadow-md'
                : 'bg-white text-[#111C2D] hover:bg-[#F0F3FF]'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                selectedPill === 'boys'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#DEE8FF] text-[#124E3F]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">male</span>
            </div>
            <span className="text-[11px] font-semibold truncate w-full">Boys</span>
          </button>

          {/* Girls */}
          <button
            type="button"
            onClick={() => handlePillClick('girls')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-center gap-1.5 ${
              selectedPill === 'girls'
                ? 'bg-[#00362A] text-white shadow-md'
                : 'bg-white text-[#111C2D] hover:bg-[#F0F3FF]'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                selectedPill === 'girls'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FFDDB8] text-[#633D00]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">female</span>
            </div>
            <span className="text-[11px] font-semibold truncate w-full">Girls</span>
          </button>
        </div>
      </section>

      {/* Popular Areas Carousel */}
      <section className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#111C2D]">Popular Areas</h2>
          <button
            onClick={() => onNavigateToSearch()}
            className="text-xs font-semibold text-[#006C49] hover:underline"
          >
            See All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {areas.map((area) => (
            <div
              key={area.id}
              onClick={() => onSelectArea(area.name)}
              className="snap-start shrink-0 w-36 flex flex-col bg-white rounded-xl overflow-hidden shadow-xs border border-[#E2E8F0]/80 transition-transform active:scale-98 cursor-pointer hover:shadow-md"
            >
              <div className="relative w-full h-24 overflow-hidden bg-[#E7EEFF]">
                <img
                  src={area.imageUrl}
                  alt={area.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-xs text-white font-bold drop-shadow">
                  {area.name}
                </span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-[11px] text-[#404945]">{area.hostelsCount}</span>
                <span className="material-symbols-outlined text-[14px] text-[#006C49]">
                  arrow_forward_ios
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for You Section */}
      <section className="flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-bold text-[#111C2D]">Recommended for You</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#6CF8BB]/30 text-xs font-semibold text-[#00714D]">
              Top Pick
            </span>
          </div>
          <button
            onClick={() => onNavigateToSearch()}
            className="text-xs font-semibold text-[#006C49] hover:underline"
          >
            See All
          </button>
        </div>

        {/* Featured Listing Cards */}
        {hostels.map((hostel) => {
          const isSaved = savedHostelIds.has(hostel.id);

          return (
            <article
              key={hostel.id}
              className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,54,42,0.06)] border border-[#E2E8F0]/70 flex flex-col space-y-3 relative group transition-all hover:shadow-md cursor-pointer"
              onClick={() => onSelectHostel(hostel)}
            >
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#E7EEFF]">
                <img
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />

                {/* Wishlist Button */}
                <button
                  type="button"
                  aria-label="Add to Wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(hostel.id);
                  }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-all z-10 ${
                    isSaved
                      ? 'bg-white text-[#BA1A1A] shadow-sm'
                      : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>

                {/* Distance Tag */}
                <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 text-[#00362A] shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                  <span className="text-[11px] font-semibold">{hostel.distanceTag}</span>
                </div>

                {/* Rating Pill */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-[#111C2D] shadow-xs">
                  <span
                    className="material-symbols-outlined text-[16px] text-[#F8A00F]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="text-[11px] font-bold">{hostel.rating}</span>
                  <span className="text-[11px] text-[#404945]">({hostel.reviewCount})</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[16px] font-bold text-[#111C2D]">{hostel.name}</h3>
                      {hostel.verified && (
                        <span
                          className="material-symbols-outlined text-[16px] text-[#006C49]"
                          title="Verified Host"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#404945] mt-0.5">{hostel.fullAddress}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[18px] font-bold text-[#00362A]">
                      ₹{hostel.monthlyRent.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-[#404945]">per month</p>
                  </div>
                </div>

                {/* Amenity Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {hostel.amenities.slice(0, 4).map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2.5 py-0.8 rounded-lg bg-[#F0F3FF] text-[#00362A] text-[11px] font-medium"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {amenity.toLowerCase().includes('wifi')
                          ? 'wifi'
                          : amenity.toLowerCase().includes('meal')
                          ? 'restaurant'
                          : amenity.toLowerCase().includes('laundry')
                          ? 'local_laundry_service'
                          : amenity.toLowerCase().includes('ac')
                          ? 'ac_unit'
                          : amenity.toLowerCase().includes('guard') || amenity.toLowerCase().includes('security')
                          ? 'security'
                          : 'check'}
                      </span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <a
                    href={`tel:${hostel.owner.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="h-11 rounded-xl bg-[#F0F3FF] text-[#00362A] font-semibold text-xs flex items-center justify-center gap-1.5 active:bg-[#DEE8FF] transition-colors border border-[#D8E3FB]/80"
                  >
                    <span className="material-symbols-outlined text-[17px]">call</span>
                    Call Direct
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDirectChat(hostel);
                    }}
                    className="h-11 rounded-xl bg-[#00362A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:bg-[#124E3F] hover:bg-[#00261D] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">chat</span>
                    Message
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
