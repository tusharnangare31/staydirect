import React, { useState, useMemo } from 'react';
import { Hostel } from '../types';
import { HostelCard } from './HostelCard';

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

const POPULAR_SEARCH_SUGGESTIONS = [
  'Kothrud',
  'Girls PG',
  'Near MIT-WPU',
  'Near COEP',
  'Single Room',
  'Food Included',
  'Under ₹8,000',
  'Hinjewadi IT Park',
  'Viman Nagar',
  'Wakad',
];

export const SearchHostelsView: React.FC<SearchHostelsViewProps> = ({
  hostels,
  initialQuery = '',
  initialCategory = 'all',
  savedHostelIds,
  onToggleSave,
  onSelectHostel,
  onOpenMap,
  onOpenFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilterPills, setActiveFilterPills] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (initialCategory && initialCategory !== 'all') {
      s.add(initialCategory);
    }
    return s;
  });
  const [sortOption, setSortOption] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Toggle filter pill
  const toggleFilterPill = (filterId: string) => {
    setActiveFilterPills((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  const filteredHostels = useMemo(() => {
    let result = [...hostels];

    // Filter by text query across name, area, address, and amenities
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.fullAddress.toLowerCase().includes(q) ||
          h.gender.toLowerCase().includes(q) ||
          h.distanceTag.toLowerCase().includes(q) ||
          h.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Filter by Category Pills
    if (activeFilterPills.has('rating-4')) {
      result = result.filter((h) => h.rating >= 4.0);
    }
    if (activeFilterPills.has('girls')) {
      result = result.filter((h) => h.gender === 'Girls');
    }
    if (activeFilterPills.has('boys')) {
      result = result.filter((h) => h.gender === 'Boys');
    }
    if (activeFilterPills.has('food')) {
      result = result.filter((h) =>
        h.amenities.some((a) => a.toLowerCase().includes('meal') || a.toLowerCase().includes('food'))
      );
    }
    if (activeFilterPills.has('under-10k') || activeFilterPills.has('budget')) {
      result = result.filter((h) => h.monthlyRent <= 10000);
    }
    if (activeFilterPills.has('verified')) {
      result = result.filter((h) => h.verified);
    }
    if (activeFilterPills.has('single')) {
      result = result.filter(
        (h) =>
          h.roomTypeTag.toLowerCase().includes('single') ||
          h.occupancies.some((o) => o.type.toLowerCase().includes('single'))
      );
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
  }, [hostels, searchQuery, activeFilterPills, sortOption]);

  return (
    <div className="w-full flex flex-col space-y-6 pb-28 pt-2 animate-fadeIn">
      {/* Centered Swiggy Search Input Box */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="relative flex items-center bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] px-5 py-4 border border-gray-200 focus-within:border-[#006C49] focus-within:shadow-[0_4px_24px_rgba(0,108,73,0.14)] transition-all">
          <span className="material-symbols-outlined text-[#006C49] text-[24px] mr-3 shrink-0">
            search
          </span>
          <input
            id="swiggy-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for hostels, areas, colleges (MIT, COEP, Symbiosis)..."
            className="w-full text-base text-[#111C2D] placeholder-gray-400 focus:outline-none bg-transparent"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </button>
          )}
        </div>

        {/* Popular Suggestions Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 px-1">
          <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider">
            Popular:
          </span>
          {POPULAR_SEARCH_SUGGESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setSearchQuery(item)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 hover:bg-emerald-50 hover:text-[#006C49] text-gray-700 transition-colors shrink-0 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Sticky Swiggy Filter Bar */}
      <section className="sticky top-16 sm:top-[72px] z-30 bg-white/95 backdrop-blur-md py-3 border-y border-[#E5E3D8] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {/* Main Filter Modal trigger */}
          <button
            onClick={onOpenFilter}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs ${
              activeFilterPills.size > 0
                ? 'border-[#00362A] bg-[#00362A] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Filter</span>
            {activeFilterPills.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#006C49] text-white text-[10px] font-extrabold flex items-center justify-center ml-0.5">
                {activeFilterPills.size}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Sort By</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 animate-fadeIn">
                {[
                  { id: 'relevance', label: 'Relevance (Default)' },
                  { id: 'rating', label: 'Ratings 4.5+ High' },
                  { id: 'price-low', label: 'Rent: Low to High' },
                  { id: 'price-high', label: 'Rent: High to Low' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortOption(s.id as typeof sortOption);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      sortOption === s.id ? 'text-[#006C49] font-bold bg-emerald-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {sortOption === s.id && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filter Pills */}
          {[
            { id: 'rating-4', label: 'Ratings 4.0+' },
            { id: 'girls', label: 'Girls Only' },
            { id: 'boys', label: 'Boys Only' },
            { id: 'food', label: 'Food Included' },
            { id: 'under-10k', label: 'Under ₹10,000' },
            { id: 'verified', label: '100% Verified' },
            { id: 'single', label: 'Single Room' },
          ].map((pill) => {
            const isSelected = activeFilterPills.has(pill.id);
            return (
              <button
                key={pill.id}
                onClick={() => toggleFilterPill(pill.id)}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                  isSelected
                    ? 'border-[#00362A] bg-[#00362A] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <span>{pill.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px]">close</span>
                )}
              </button>
            );
          })}

          {/* Map View Toggle */}
          <button
            onClick={() => onOpenMap()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-700 hover:border-[#006C49] hover:text-[#006C49] transition-all shrink-0 ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Map View</span>
          </button>

          {activeFilterPills.size > 0 && (
            <button
              onClick={() => setActiveFilterPills(new Set())}
              className="text-xs font-bold text-[#006C49] hover:underline px-2 shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-600">
          {filteredHostels.length} {filteredHostels.length === 1 ? 'hostel' : 'hostels'} found
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </span>
      </div>

      {/* Hostels Card Grid */}
      {filteredHostels.length === 0 ? (
        <div className="w-full bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006C49] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">search_off</span>
          </div>
          <h3 className="text-lg font-bold text-[#111C2D]">No matching hostels found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try searching for a different area like Kothrud, Hinjewadi, or clear your applied filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilterPills(new Set());
            }}
            className="px-5 py-2.5 bg-[#006C49] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredHostels.map((hostel) => {
            const isSaved = savedHostelIds.has(hostel.id);
            return (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                onClick={() => onSelectHostel(hostel)}
                isSaved={isSaved}
                onToggleSave={onToggleSave}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
