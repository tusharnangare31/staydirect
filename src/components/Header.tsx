import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  title?: string;
  currentUser: UserProfile | null;
  onOpenAuth: (role?: 'student' | 'owner', context?: string) => void;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenLocationDrawer?: () => void;
  selectedLocation?: string;
  onNavigate?: (screen: string) => void;
  savedCount?: number;
  unreadInquiriesCount?: number;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenDrawer,
  onOpenNotifications,
  onOpenProfile,
  onOpenLocationDrawer,
  selectedLocation = 'Kothrud',
  onNavigate,
  savedCount = 0,
  unreadInquiriesCount = 0,
  onBack,
  showBack = false,
}) => {
  const isStudent = currentUser?.role === 'student';
  const isOwner = currentUser?.role === 'owner';
  const isGuest = !currentUser;

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E3D8] shadow-2xs">
      <div className="max-w-[1240px] mx-auto h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left Section: Back / Menu + Logo + Location Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#111C2D] hover:bg-[#F1EFE6] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              aria-label="Open Navigation Drawer"
              className="lg:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#111C2D] hover:bg-[#F1EFE6] transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}

          {/* StayDirect Brand Mark */}
          <button
            onClick={() => onNavigate?.(isOwner ? 'owner-home' : 'student-home')}
            className="flex items-center gap-2 text-left group shrink-0 cursor-pointer"
            aria-label="StayDirect Home"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-2xs group-hover:scale-105 transition-transform shrink-0 border border-[#00362A]/20">
              <img
                src="/icon.svg"
                alt="StayDirect Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-[#111C2D] tracking-tight leading-none">
                  Stay<span className="text-[#173B2C]">Direct</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#15803D] border border-[#B8CEAA] tracking-wider">
                  ₹0 Brokerage
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#5C6470] -mt-0.5 hidden md:block">
                Pune&apos;s Verified Hostels &amp; PGs
              </span>
            </div>
          </button>

          {/* Location Selector */}
          <button
            onClick={onOpenLocationDrawer}
            className="flex items-center gap-1 py-1 px-2 rounded-lg bg-[#F8F7F1] sm:bg-transparent hover:bg-[#F1EFE6] transition-colors group text-left cursor-pointer border border-[#E5E3D8] sm:border-0 sm:border-l sm:border-[#E5E3D8] sm:pl-3 shrink-0 ml-1"
            title="Change Pune Area"
          >
            <span className="material-symbols-outlined text-[#173B2C] text-[16px] sm:text-[18px] shrink-0">
              location_on
            </span>
            <div className="flex items-center gap-0.5 max-w-[85px] sm:max-w-[130px] md:max-w-[170px]">
              <span className="font-bold text-xs text-[#111C2D] group-hover:text-[#173B2C] transition-colors truncate">
                {selectedLocation}
              </span>
              <span className="text-[10px] text-[#8E95A2] truncate hidden md:inline">
                , Pune
              </span>
            </div>
            <span className="material-symbols-outlined text-[#5C6470] text-[15px] group-hover:translate-y-0.5 transition-transform shrink-0">
              expand_more
            </span>
          </button>
        </div>

        {/* Center Section: Desktop Navigation Links (Large screens only) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <button
            onClick={() => onNavigate?.('search')}
            className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
          </button>

          <button
            onClick={() => onNavigate?.('map')}
            className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Pune Map</span>
          </button>

          <button
            onClick={() => onNavigate?.('about')}
            className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Zero Brokerage</span>
          </button>

          <button
            onClick={() => onNavigate?.('help')}
            className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Help</span>
          </button>
        </div>

        {/* Right Section: User State Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 1. GUEST STATE */}
          {isGuest && (
            <>
              {/* List Property CTA for Hostel Owners */}
              <button
                onClick={() =>
                  onOpenAuth('owner', 'Sign in as a verified hostel owner to list rooms and manage student inquiries.')
                }
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#B8CEAA] bg-[#DCFCE7]/30 hover:bg-[#DCFCE7] text-[#15803D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">domain_add</span>
                <span>List Property</span>
              </button>

              {/* Main Sign In Button */}
              <button
                onClick={() => onOpenAuth('student')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#173B2C] hover:bg-[#24523F] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
              </button>
            </>
          )}

          {/* 2. LOGGED IN STUDENT STATE */}
          {isStudent && (
            <>
              {/* Saved Shortlist Link */}
              <button
                onClick={() => onNavigate?.('saved')}
                aria-label="Saved Hostels"
                className="flex items-center gap-1.5 text-xs font-bold text-[#5C6470] hover:text-[#173B2C] transition-colors relative p-1.5 rounded-lg hover:bg-[#F8F7F1] cursor-pointer"
                title="Saved Shortlist"
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  {savedCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#173B2C] text-white text-[10px] font-black flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Saved</span>
              </button>

              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                aria-label="Open notifications"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5C6470] hover:bg-[#F1EFE6] transition-colors relative shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="w-2 h-2 rounded-full bg-[#15803D] absolute top-1.5 right-1.5 ring-2 ring-white" />
              </button>

              {/* Student Profile Pill */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 py-1 px-2 rounded-xl bg-[#F8F7F1] border border-[#E5E3D8] hover:border-[#173B2C]/40 transition-colors shrink-0 cursor-pointer"
                aria-label="Student Profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#15803D] font-black text-xs flex items-center justify-center ring-1 ring-[#B8CEAA] shrink-0">
                  {currentUser.name
                    ? currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'ST'}
                </div>
                <div className="flex flex-col text-left max-w-[80px] sm:max-w-[100px]">
                  <span className="text-xs font-black text-[#111C2D] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-[#15803D] font-bold truncate leading-none">
                    Student
                  </span>
                </div>
              </button>
            </>
          )}

          {/* 3. LOGGED IN OWNER STATE */}
          {isOwner && (
            <>
              {/* Add Hostel Quick Action */}
              <button
                onClick={() => onNavigate?.('add-hostel')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#173B2C] hover:bg-[#24523F] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span className="hidden sm:inline">Add Hostel</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Student Inquiries Alert Button */}
              <button
                onClick={() => onNavigate?.('owner-inquiries')}
                aria-label="Student Inquiries"
                className="flex items-center gap-1.5 text-xs font-bold text-[#5C6470] hover:text-[#173B2C] transition-colors relative p-1.5 rounded-lg hover:bg-[#F8F7F1] cursor-pointer"
                title="Student Inquiries"
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                  {unreadInquiriesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                      {unreadInquiriesCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Inquiries</span>
              </button>

              {/* Owner Profile / Business Pill */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 py-1 px-2 rounded-xl bg-[#DCFCE7]/40 border border-[#B8CEAA] hover:bg-[#DCFCE7] transition-colors shrink-0 cursor-pointer"
                aria-label="Owner Profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#173B2C] text-white font-black text-xs flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">domain</span>
                </div>
                <div className="flex flex-col text-left max-w-[80px] sm:max-w-[110px]">
                  <span className="text-xs font-black text-[#173B2C] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-[#15803D] font-extrabold truncate leading-none">
                    Owner Hub
                  </span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
