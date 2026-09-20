import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  title?: string;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenLocationDrawer?: () => void;
  selectedLocation?: string;
  onNavigate?: (screen: string) => void;
  savedCount?: number;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onToggleRole,
  onOpenDrawer,
  onOpenNotifications,
  onOpenProfile,
  onOpenLocationDrawer,
  selectedLocation = 'Kothrud',
  onNavigate,
  savedCount = 0,
  onBack,
  showBack = false,
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E3D8] shadow-2xs">
      <div className="max-w-[1240px] mx-auto h-16 sm:h-18 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Back / Menu + Logo + Location Selector */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="w-9 h-9 sm:w-10 sm:h-10 -ml-1 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#F8F7F1] active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              aria-label="Open Navigation Drawer"
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 -ml-1 rounded-xl flex items-center justify-center text-[#111C2D] hover:bg-[#F8F7F1] transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">menu</span>
            </button>
          )}

          {/* StayDirect Brand Mark */}
          <button
            onClick={() => onNavigate?.(userRole === 'student' ? 'student-home' : 'owner-home')}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#0D231A] to-[#173B2C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">home_pin</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-[#111C2D] tracking-tight leading-none">
                  Stay<span className="text-[#173B2C]">Direct</span>
                </span>
                <span className="hidden md:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#B8CEAA] tracking-wider">
                  ₹0 Brokerage
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#5C6470] -mt-0.5 hidden lg:block">
                Pune Student Hostels & PGs
              </span>
            </div>
          </button>

          {/* Location Picker (Visible on sm and up) */}
          <button
            onClick={onOpenLocationDrawer}
            className="hidden sm:flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F8F7F1] transition-colors group text-left cursor-pointer border-l border-[#E5E3D8] pl-3 shrink-0"
          >
            <span className="material-symbols-outlined text-[#173B2C] text-[18px] shrink-0">
              location_on
            </span>
            <div className="flex items-center gap-1 max-w-[100px] md:max-w-[150px] lg:max-w-[220px]">
              <span className="font-bold text-xs sm:text-sm text-[#111C2D] border-b border-[#111C2D] group-hover:border-[#173B2C] group-hover:text-[#173B2C] transition-all truncate">
                {selectedLocation}
              </span>
              <span className="text-[11px] text-[#8E95A2] truncate hidden lg:inline">
                , Pune
              </span>
            </div>
            <span className="material-symbols-outlined text-[#173B2C] text-[16px] group-hover:translate-y-0.5 transition-transform shrink-0">
              expand_more
            </span>
          </button>
        </div>

        {/* Right Section: Navigation Items & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 lg:gap-6 shrink-0">
          {/* Mobile Location Quick Pill (Only on xs screens < sm) */}
          <button
            onClick={onOpenLocationDrawer}
            className="sm:hidden flex items-center gap-1 text-[11px] font-bold text-[#111C2D] px-2 py-1 rounded-lg bg-[#F1EFE6] border border-[#E5E3D8] max-w-[110px] shrink truncate"
            aria-label="Select Pune locality"
          >
            <span className="material-symbols-outlined text-[#173B2C] text-[15px] shrink-0">location_on</span>
            <span className="truncate">{selectedLocation}</span>
          </button>

          {/* Desktop Navigation Links (Large screens only: lg and above) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            <button
              onClick={() => onNavigate?.('search')}
              className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">search</span>
              <span>Search</span>
            </button>

            <button
              onClick={() => onNavigate?.('about')}
              className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors relative"
            >
              <span className="material-symbols-outlined text-[19px]">verified</span>
              <span>Zero Brokerage</span>
              <span className="text-[9px] font-black text-white bg-[#15803D] px-1.5 py-0.2 rounded-full -top-2 -right-3">
                0%
              </span>
            </button>

            <button
              onClick={() => onNavigate?.('help')}
              className="flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">support_agent</span>
              <span>Help</span>
            </button>
          </div>

          {/* Saved Shortlist Link */}
          <button
            onClick={() => onNavigate?.('saved')}
            aria-label="Saved Hostels"
            className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#5C6470] hover:text-[#173B2C] transition-colors relative px-2 py-1 rounded-lg hover:bg-[#F8F7F1]"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#173B2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline">Saved</span>
          </button>

          {/* Role Switcher Pill (Student vs Owner) - visible on md and up so it doesn't crowd mobile */}
          <button
            onClick={onToggleRole}
            title={userRole === 'student' ? 'Switch to Owner Dashboard' : 'Switch to Student View'}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs active:scale-95 shrink-0 ${
              userRole === 'owner'
                ? 'bg-[#173B2C] text-white border-[#173B2C] hover:bg-[#24523F]'
                : 'bg-[#DCFCE7] text-[#15803D] border-[#B8CEAA] hover:bg-emerald-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {userRole === 'student' ? 'domain' : 'school'}
            </span>
            <span>{userRole === 'student' ? 'Hostel Owner?' : 'Student Mode'}</span>
          </button>

          {/* User Account / Profile */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-xl hover:bg-[#F1EFE6] transition-colors shrink-0"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#DDE9D5] text-[#173B2C] font-bold text-xs flex items-center justify-center ring-1 ring-[#B8CEAA] shrink-0">
              {userRole === 'student' ? 'RS' : 'OW'}
            </div>
            <span className="hidden xl:inline text-xs font-bold text-[#111C2D]">
              {userRole === 'student' ? 'Rahul' : 'Owner'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Open notifications"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[#5C6470] hover:bg-[#F1EFE6] transition-colors relative shrink-0"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
