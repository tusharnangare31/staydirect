import React, { useState, useMemo } from 'react';
import { Hostel } from '../types';

interface SearchHostelsViewProps {
  hostels: Hostel[];
  initialQuery?: string;
  initialCategory?: string;
  savedHostelIds: Set<string>;
  onToggleSave: (id: string) => void;
  onSelectHostel: (hostel: Hostel) => void;
  onOpenMap: (areaName?: string) => void;
  onOpenFilter: () => void;
}

export const SearchHostelsView: React.FC<SearchHostelsViewProps> = ({
  hostels,
  initialQuery = 'Hinjewadi, Pune',
  initialCategory = 'all',
  savedHostelIds,
  onToggleSave,
  onSelectHostel,
  onOpenMap,
  onOpenFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedFilter, setSelectedFilter] = useState(initialCategory);
  const [sortOption, setSortOption] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filterPills = [
    { id: 'all', label: 'All' },
    { id: 'pg', label: 'PG' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'boys', label: 'Boys' },
    { id: 'girls', label: 'Girls' },
    { id: 'nearby', label: 'Nearby' },
  ];

  const filteredHostels = useMemo(() => {
    let result = [...hostels];

    // Filter by text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.fullAddress.toLowerCase().includes(q)
      );
    }

    // Filter by Category Pill
    if (selectedFilter === 'pg') {
      result = result.filter((h) => h.category === 'PG');
    } else if (selectedFilter === 'hostel') {
      result = result.filter((h) => h.category === 'Hostel');
    } else if (selectedFilter === 'boys') {
      result = result.filter((h) => h.gender === 'Boys');
    } else if (selectedFilter === 'girls') {
      result = result.filter((h) => h.gender === 'Girls');
    } else if (selectedFilter === 'colleges') {
      result = result.filter((h) => h.distanceTag.toLowerCase().includes('symbiosis') || h.distanceTag.toLowerCase().includes('college'));
    }

    // Sort
    if (sortOption === 'price-low') {
      result.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [hostels, searchQuery, selectedFilter, sortOption]);

  const currentSortLabel = {
    relevance: 'Sort',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    rating: 'Highest Rated',
  }[sortOption];

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Search & Location Bar */}
      <section className="w-full flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5 shadow-sm border border-[#E2E8F0]">
          <span className="material-symbols-outlined text-[#00362A] text-[20px] mr-2">search</span>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area, college, hostel..."
            className="w-full bg-transparent text-sm text-[#111C2D] focus:outline-none placeholder:text-[#707975]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#BFC9C3] hover:text-[#404945] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilter}
          aria-label="Filter options"
          className="w-11 h-11 flex items-center justify-center bg-white rounded-xl shadow-sm text-[#00362A] border border-[#E2E8F0] transition-colors hover:bg-[#F0F3FF] shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </section>

      {/* Quick Filter Category Pills */}
      <section
        aria-label="Quick filters"
        className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar flex items-center gap-2 pb-2 mb-2"
      >
        {filterPills.map((pill) => {
          const isActive = selectedFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedFilter(pill.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                isActive
                  ? 'bg-[#124E3F] text-white'
                  : 'bg-white text-[#404945] border border-[#E2E8F0] hover:bg-[#F0F3FF]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </section>

      {/* Results Summary & Sorting Strip */}
      <section className="w-full flex items-center justify-between py-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#006C49]" />
          <span className="text-xs font-bold text-[#111C2D]">
            {filteredHostels.length > 0 ? `${filteredHostels.length * 8} hostels found` : '0 hostels found'}
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#404945] shadow-xs text-xs font-semibold hover:text-[#00362A] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            <span>{currentSortLabel}</span>
          </button>

          {/* Sort Dropdown Menu */}
          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-20">
              <button
                type="button"
                onClick={() => {
                  setSortOption('relevance');
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  sortOption === 'relevance'
                    ? 'text-[#00362A] bg-[#F0F3FF]'
                    : 'text-[#404945] hover:bg-[#F9F9FF]'
                }`}
              >
                Relevance
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('price-low');
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  sortOption === 'price-low'
                    ? 'text-[#00362A] bg-[#F0F3FF]'
                    : 'text-[#404945] hover:bg-[#F9F9FF]'
                }`}
              >
                Price: Low to High
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('price-high');
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  sortOption === 'price-high'
                    ? 'text-[#00362A] bg-[#F0F3FF]'
                    : 'text-[#404945] hover:bg-[#F9F9FF]'
                }`}
              >
                Price: High to Low
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('rating');
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  sortOption === 'rating'
                    ? 'text-[#00362A] bg-[#F0F3FF]'
                    : 'text-[#404945] hover:bg-[#F9F9FF]'
                }`}
              >
                Highest Rated
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hostel Listing Feed */}
      <section aria-label="Hostel listings" className="flex flex-col gap-3 w-full">
        {filteredHostels.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E2E8F0]">
            <span className="material-symbols-outlined text-[40px] text-[#707975] mb-2">
              search_off
            </span>
            <h3 className="text-base font-bold text-[#111C2D]">No hostels match your search</h3>
            <p className="text-xs text-[#404945] mt-1">
              Try adjusting your search area or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#00362A] text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredHostels.map((hostel) => {
            const isSaved = savedHostelIds.has(hostel.id);

            return (
              <article
                key={hostel.id}
                onClick={() => onSelectHostel(hostel)}
                className="w-full bg-white rounded-xl p-3 shadow-xs border border-[#E2E8F0]/80 hover:shadow-md transition-shadow relative cursor-pointer group"
              >
                <div className="flex gap-3">
                  {/* Property Image & Badge */}
                  <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#E7EEFF]">
                    <img
                      src={hostel.imageUrl}
                      alt={hostel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#00362A]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {hostel.roomTypeTag}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#111C2D] truncate">
                            {hostel.name}
                          </h3>
                          <p className="text-xs text-[#404945] truncate">{hostel.fullAddress}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Save ${hostel.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(hostel.id);
                          }}
                          className={`p-1 transition-colors ${
                            isSaved ? 'text-[#BA1A1A]' : 'text-[#BFC9C3] hover:text-[#BA1A1A]'
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      {/* Rating pill */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5 bg-[#FFDDB8] px-1.5 py-0.5 rounded text-[11px] font-bold text-[#2A1700]">
                          <span
                            className="material-symbols-outlined text-[13px] text-[#F8A00F]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span>{hostel.rating}</span>
                        </div>
                        <span className="text-xs text-[#707975]">({hostel.reviewCount} reviews)</span>
                      </div>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex items-center gap-1.5 my-1 flex-wrap">
                      {hostel.amenities.slice(0, 2).map((amenity, i) => (
                        <span
                          key={i}
                          className="bg-[#F0F3FF] text-[#00362A] text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {amenity.toLowerCase().includes('wi-fi') || amenity.toLowerCase().includes('wifi')
                              ? 'wifi'
                              : amenity.toLowerCase().includes('meal')
                              ? 'restaurant'
                              : amenity.toLowerCase().includes('laundry')
                              ? 'local_laundry_service'
                              : amenity.toLowerCase().includes('ac')
                              ? 'ac_unit'
                              : 'check'}
                          </span>
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Price & Zero Brokerage Tag */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-[#F0F3FF]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#00362A]">
                          ₹{hostel.monthlyRent.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-[#707975]">/month</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#006C49] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">
                          {hostel.instantVisit ? 'bolt' : 'verified'}
                        </span>
                        {hostel.instantVisit ? 'Instant Visit' : 'Zero Brokerage'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Floating Map Exploration Trigger Button */}
      <div className="mt-4 flex justify-center w-full">
        <button
          type="button"
          onClick={() => onOpenMap(searchQuery || 'Hinjewadi')}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#00362A] text-white shadow-md hover:bg-[#124E3F] transition-all active:scale-95 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[20px]">map</span>
          <span>View on Map ({searchQuery.includes('Hinjewadi') ? 'Hinjewadi' : 'Pune'})</span>
        </button>
      </div>
    </div>
  );
};
