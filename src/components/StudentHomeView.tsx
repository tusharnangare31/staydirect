import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Hostel, Area } from '../types';
import { HostelCard } from './HostelCard';
import {
  THEME,
  DISCOVERY_CATEGORIES,
  POPULAR_COLLEGE_HUBS,
  formatIndianRupees,
} from '../theme';

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
  selectedLocation?: string;
  onOpenLocationDrawer?: () => void;
  onOpenSavedModal?: () => void;
}

// Dynamic Rotating Search Placeholders matching React Native app
const SEARCH_PLACEHOLDERS = [
  'Search "Kothrud hostels near MIT-WPU"...',
  'Search "Girls PG with meals in Viman Nagar"...',
  'Search "Single room near COEP Shivajinagar"...',
  'Search "₹0 Brokerage direct owner hostels"...',
  'Search "PICT Dhankawadi boys hostel with mess"...',
];

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
  selectedLocation = 'Kothrud',
  onOpenLocationDrawer,
  onOpenSavedModal,
}) => {
  // Search placeholder animation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Filter States matching React Native index.tsx
  const [activeFilterPills, setActiveFilterPills] = useState<Set<string>>(new Set());
  const [activeSort, setActiveSort] = useState<'relevance' | 'rating' | 'price-low' | 'price-high'>('relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTrustInfo, setShowTrustInfo] = useState(false);

  // Horizontal Scroll Container Refs
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const topHostelsScrollRef = useRef<HTMLDivElement>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  // Scroll helpers
  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Filter category circle click handler
  const handleCategoryClick = (cat: typeof DISCOVERY_CATEGORIES[0]) => {
    // If it maps to a filter pill, toggle it
    if (cat.id === 'girls' || cat.id === 'boys' || cat.id === 'food' || cat.id === 'ac' || cat.id === 'single' || cat.id === 'budget' || cat.id === 'verified') {
      toggleFilterPill(cat.id);
    } else {
      onNavigateToSearch('', cat.filterVal);
    }
  };

  // Filtered hostels calculation
  const filteredHostels = useMemo(() => {
    let list = [...hostels];

    // Filter by selected location if not "All Pune"
    if (selectedLocation && selectedLocation !== 'All Pune') {
      const loc = selectedLocation.toLowerCase();
      const matched = list.filter(
        (h) => h.area.toLowerCase().includes(loc) || h.fullAddress.toLowerCase().includes(loc)
      );
      if (matched.length > 0) {
        list = matched;
      }
    }

    // Apply Filter Pills
    if (activeFilterPills.has('girls')) {
      list = list.filter((h) => h.gender === 'Girls');
    }
    if (activeFilterPills.has('boys')) {
      list = list.filter((h) => h.gender === 'Boys');
    }
    if (activeFilterPills.has('single')) {
      list = list.filter(
        (h) =>
          h.roomTypeTag.toLowerCase().includes('single') ||
          h.occupancies.some((o) => o.type.toLowerCase().includes('single'))
      );
    }
    if (activeFilterPills.has('double')) {
      list = list.filter(
        (h) =>
          h.roomTypeTag.toLowerCase().includes('twin') ||
          h.roomTypeTag.toLowerCase().includes('double') ||
          h.occupancies.some((o) => o.type.toLowerCase().includes('twin') || o.type.toLowerCase().includes('double'))
      );
    }
    if (activeFilterPills.has('food')) {
      list = list.filter((h) =>
        h.amenities.some((a) => a.toLowerCase().includes('meal') || a.toLowerCase().includes('food') || a.toLowerCase().includes('mess'))
      );
    }
    if (activeFilterPills.has('ac')) {
      list = list.filter(
        (h) =>
          h.roomTypeTag.toLowerCase().includes('ac') ||
          h.amenities.some((a) => a.toLowerCase().includes('ac'))
      );
    }
    if (activeFilterPills.has('budget')) {
      list = list.filter((h) => h.monthlyRent <= 8000);
    }
    if (activeFilterPills.has('verified')) {
      list = list.filter((h) => h.verified);
    }

    // Sort
    if (activeSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === 'price-low') {
      list.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => b.monthlyRent - a.monthlyRent);
    }

    return list;
  }, [hostels, selectedLocation, activeFilterPills, activeSort]);

  // Top rated hostels (rating >= 4.6)
  const topRatedHostels = useMemo(() => {
    return [...hostels].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [hostels]);

  // Recommended Hostels with student explainable match badges
  const recommendedHostels = useMemo(() => {
    return [
      {
        hostel: hostels.find((h) => h.area === 'Kothrud') || hostels[0],
        reason: 'Near MIT-WPU campus • Verified mess',
      },
      {
        hostel: hostels.find((h) => h.area === 'Shivajinagar') || hostels[1],
        reason: '400m to COEP • Ideal for study prep',
      },
      {
        hostel: hostels.find((h) => h.area === 'Viman Nagar') || hostels[2],
        reason: 'Walking distance to Symbiosis • High safety rating',
      },
      {
        hostel: hostels.find((h) => h.area === 'Dhankawadi') || hostels[3],
        reason: 'Near PICT • Budget friendly under ₹7k',
      },
    ].filter((item) => !!item.hostel);
  }, [hostels]);

  return (
    <div className="w-full flex flex-col space-y-9 pb-24 pt-2 animate-fadeIn">
      {/* 1. React Native Style Top Trigger Search & Location Bar */}
      <section className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3D8] shadow-xs space-y-3.5">
        {/* Top Location & Actions Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onOpenLocationDrawer}
            className="flex items-center gap-2 text-left group hover:opacity-80 transition-opacity"
            aria-label="Change Pune locality"
          >
            <div className="w-9 h-9 rounded-full bg-[#E8F5EE] text-[#173B2C] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-base text-[#111C2D]">
                  {selectedLocation ? `${selectedLocation}, Pune` : 'Pune, Maharashtra'}
                </span>
                <span className="material-symbols-outlined text-[#173B2C] text-[18px]">
                  expand_more
                </span>
              </div>
              <p className="text-[11px] text-[#5C6470] font-medium -mt-0.5">
                Tap to change student zone or campus
              </p>
            </div>
          </button>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            {onOpenSavedModal && (
              <button
                onClick={onOpenSavedModal}
                className="relative w-9 h-9 rounded-full bg-[#F1EFE6] hover:bg-[#E5E3D8] text-[#111C2D] flex items-center justify-center transition-colors"
                aria-label="Saved Hostels"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
                {savedHostelIds.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {savedHostelIds.size}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => onNavigateToSearch()}
              className="w-9 h-9 rounded-full bg-[#173B2C] hover:bg-[#24523F] text-white flex items-center justify-center transition-colors shadow-xs"
              aria-label="AI Recommendations"
              title="Personalized Recommendations"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </button>
          </div>
        </div>

        {/* Search Trigger Bar with animated rotating placeholder */}
        <div
          onClick={() => onNavigateToSearch()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8F7F1] border border-[#E5E3D8] hover:border-[#173B2C]/50 hover:bg-white transition-all cursor-pointer shadow-2xs group"
        >
          <span className="material-symbols-outlined text-[#173B2C] text-[22px] shrink-0 group-hover:scale-110 transition-transform">
            search
          </span>

          <div className="flex-1 overflow-hidden">
            <p className="text-xs sm:text-sm font-medium text-[#5C6470] truncate transition-all duration-300">
              {SEARCH_PLACEHOLDERS[placeholderIndex]}
            </p>
          </div>

          <div className="w-[1px] h-5 bg-[#E5E3D8]" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFilter();
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#173B2C] hover:text-[#0D231A] pl-1"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </section>

      {/* 2. Zero Brokerage Direct Owner Trust Banner */}
      <section className="w-full bg-[#173B2C] text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-24 -top-8 w-28 h-28 rounded-full bg-emerald-400/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F766E] text-white text-[11px] font-extrabold tracking-wider uppercase">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              ₹0 BROKERAGE GUARANTEE
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Direct Owner Bookings Only
            </h2>
            <p className="text-xs sm:text-sm text-[#DDE9D5] font-medium leading-relaxed">
              No agents, no commission. Connect directly with verified Pune owners and save ₹15,000+ on security and middleman cuts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToSearch('', 'verified')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#173B2C] hover:bg-[#F8F7F1] font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>View Verified Hostels</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. React Native "What are you looking for?" Quick Filter Category Circles */}
      <section className="w-full space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#111C2D] tracking-tight">
              What are you looking for?
            </h2>
            <p className="text-xs text-[#5C6470] mt-0.5">
              Quickly filter by room preference, food, budget, or college proximity
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollContainer(categoryScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Scroll categories left"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <button
              onClick={() => scrollContainer(categoryScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Scroll categories right"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Circular Categories Row */}
        <div
          ref={categoryScrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {DISCOVERY_CATEGORIES.map((cat) => {
            const isSelected = activeFilterPills.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full ${cat.bgColor} border ${
                    isSelected ? 'ring-3 ring-[#173B2C] border-[#173B2C]' : cat.borderColor
                  } flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-200`}
                >
                  <span className={`material-symbols-outlined text-[28px] sm:text-[32px] ${cat.iconColor}`}>
                    {cat.icon}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold text-center whitespace-nowrap transition-colors ${
                    isSelected ? 'text-[#173B2C] underline decoration-2' : 'text-[#111C2D] group-hover:text-[#173B2C]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Top Rated Hostels in Pune Carousel */}
      <section className="w-full space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#111C2D] tracking-tight">
                Top Rated Hostels in Pune
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold">
                ★ 4.7+
              </span>
            </div>
            <p className="text-xs text-[#5C6470] mt-0.5">
              Highest rated properties with direct owner contact and verified student reviews
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToSearch('', 'rating')}
              className="text-xs font-bold text-[#173B2C] hover:underline mr-1"
            >
              See all
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollContainer(topHostelsScrollRef, 'left')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <button
                onClick={() => scrollContainer(topHostelsScrollRef, 'right')}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Rated Horizontal Scrolling Strip */}
        <div
          ref={topHostelsScrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {topRatedHostels.map((hostel) => (
            <div key={hostel.id} className="w-[280px] sm:w-[320px] shrink-0">
              <HostelCard
                hostel={hostel}
                onClick={() => onSelectHostel(hostel)}
                isSaved={savedHostelIds.has(hostel.id)}
                onToggleSave={onToggleSave}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recommended for You (Personalized Recommendations) */}
      <section className="w-full space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-[#111C2D] tracking-tight">
              Recommended for You
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-[#F1EFE6] text-[#173B2C] text-[11px] font-bold border border-[#E5E3D8] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#C28A52]">auto_awesome</span>
              Personalized
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollContainer(recommendedScrollRef, 'left')}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <button
              onClick={() => scrollContainer(recommendedScrollRef, 'right')}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-[#111C2D] border border-[#E5E3D8] flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Recommended Horizontal Cards */}
        <div
          ref={recommendedScrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {recommendedHostels.map(({ hostel, reason }) => (
            <div key={hostel.id} className="w-[280px] sm:w-[320px] shrink-0">
              <HostelCard
                hostel={hostel}
                onClick={() => onSelectHostel(hostel)}
                isSaved={savedHostelIds.has(hostel.id)}
                onToggleSave={onToggleSave}
                recommendationReason={reason}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Popular Pune Student Zones / College Hubs */}
      <section className="w-full space-y-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#111C2D] tracking-tight">
            Popular Pune Student Zones
          </h2>
          <p className="text-xs text-[#5C6470] mt-0.5">
            Find hostels walking distance from your college campus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {POPULAR_COLLEGE_HUBS.map((hub) => {
            const isSelected = selectedLocation.toLowerCase().includes(hub.name.toLowerCase());
            return (
              <button
                key={hub.name}
                onClick={() => onSelectArea(hub.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left flex flex-col cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#173B2C] text-white border-[#173B2C] shadow-sm'
                    : 'bg-white text-[#111C2D] border-[#E5E3D8] hover:border-[#173B2C]/40 hover:bg-[#F8F7F1]'
                }`}
              >
                <span className="leading-tight">{hub.name}</span>
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    isSelected ? 'text-[#DDE9D5]' : 'text-[#5C6470]'
                  }`}
                >
                  {hub.college}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Main List Section with Quick Filter Pills */}
      <section className="w-full space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#111C2D] tracking-tight">
              Verified Hostels in {selectedLocation || 'Pune'}
            </h2>
            <p className="text-xs text-[#5C6470] mt-0.5">
              Showing {filteredHostels.length} direct owner properties • 100% zero brokerage
            </p>
          </div>
        </div>

        {/* Sticky Filter Bar matching React Native */}
        <div className="sticky top-16 sm:top-[72px] z-30 bg-[#F8F7F1]/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-y border-[#E5E3D8]/80">
          <div className="max-w-[1240px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Filter Drawer Trigger */}
            <button
              onClick={onOpenFilter}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs ${
                activeFilterPills.size > 0
                  ? 'border-[#173B2C] bg-[#173B2C] text-white'
                  : 'border-[#E5E3D8] bg-white text-[#111C2D] hover:border-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filter</span>
              {activeFilterPills.size > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#15803D] text-white text-[10px] font-extrabold flex items-center justify-center ml-0.5">
                  {activeFilterPills.size}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#E5E3D8] bg-white text-[#111C2D] hover:border-gray-400 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <span>
                  Sort:{' '}
                  {activeSort === 'relevance'
                    ? 'Relevance'
                    : activeSort === 'rating'
                    ? 'Rating'
                    : activeSort === 'price-low'
                    ? 'Price: Low'
                    : 'Price: High'}
                </span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {showSortDropdown && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-[#E5E3D8] p-1.5 z-40 space-y-1">
                  {[
                    { id: 'relevance', label: 'Relevance (Default)' },
                    { id: 'rating', label: 'Rating: High to Low' },
                    { id: 'price-low', label: 'Price: Low to High' },
                    { id: 'price-high', label: 'Price: High to Low' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setActiveSort(opt.id as any);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeSort === opt.id
                          ? 'bg-[#E8F5EE] text-[#173B2C]'
                          : 'text-[#5C6470] hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Filter Pills */}
            {[
              { id: 'girls', label: 'Girls Hostels' },
              { id: 'boys', label: 'Boys Hostels' },
              { id: 'single', label: 'Single Room' },
              { id: 'double', label: 'Twin Sharing' },
              { id: 'food', label: 'Mess / Food Included' },
              { id: 'ac', label: 'AC Rooms' },
              { id: 'budget', label: 'Under ₹8,000' },
              { id: 'verified', label: '100% Verified' },
            ].map((pill) => {
              const isSelected = activeFilterPills.has(pill.id);
              return (
                <button
                  key={pill.id}
                  onClick={() => toggleFilterPill(pill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap ${
                    isSelected
                      ? 'border-[#173B2C] bg-[#173B2C] text-white'
                      : 'border-[#E5E3D8] bg-white text-[#5C6470] hover:border-gray-400 hover:text-[#111C2D]'
                  }`}
                >
                  {pill.label}
                  {isSelected && <span className="ml-1 text-[11px] font-black">&times;</span>}
                </button>
              );
            })}

            {activeFilterPills.size > 0 && (
              <button
                onClick={() => setActiveFilterPills(new Set())}
                className="text-xs font-bold text-red-600 hover:underline shrink-0 px-2"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* 8. Responsive Grid of Hostel Cards */}
        {filteredHostels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHostels.map((hostel) => (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                onClick={() => onSelectHostel(hostel)}
                isSaved={savedHostelIds.has(hostel.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E3D8] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111C2D]">No Hostels Match Your Selected Filters</h3>
              <p className="text-xs text-[#5C6470] mt-1">
                Try removing some filters or change your Pune locality to explore available stays.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveFilterPills(new Set());
                onSelectArea('All Pune');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#173B2C] text-white font-bold text-xs hover:bg-[#24523F] transition-colors"
            >
              Reset Filters & Show All Pune Hostels
            </button>
          </div>
        )}
      </section>

      {/* 9. Direct Owner Trust Guarantee Strip */}
      <section className="w-full bg-white rounded-2xl border border-[#E5E3D8] p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">savings</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111C2D]">Strictly Zero Commission</h4>
              <p className="text-[11px] text-[#5C6470] mt-0.5">
                Direct owner-to-student connection. We never charge brokerage fees.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111C2D]">Physically Verified Properties</h4>
              <p className="text-[11px] text-[#5C6470] mt-0.5">
                Every hostel is verified by our Pune field team for safety and hygiene.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111C2D]">Deposit Refund Guarantee</h4>
              <p className="text-[11px] text-[#5C6470] mt-0.5">
                Standardized rental agreements protecting student deposit refunds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
