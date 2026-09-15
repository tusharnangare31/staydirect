import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  title: string;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAppModal?: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  userRole,
  onToggleRole,
  onOpenDrawer,
  onOpenNotifications,
  onOpenProfile,
  onOpenAppModal,
  onBack,
  showBack = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#F9F9FF]/90 backdrop-blur-xl border-b border-[#E2E8F0]/70">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between gap-2">
        {/* Left section: Back or Drawer + Brand */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#E7EEFF] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={onOpenDrawer}
              aria-label="Open Navigation Menu"
              className="w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-[#00362A] hover:bg-[#E7EEFF] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}

          {/* Logo Emblem & Screen Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#00362A] flex items-center justify-center text-white shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[17px]">home</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[#00362A] text-base leading-tight truncate">
                {title}
              </span>
              <span className="text-[10px] text-[#404945] font-medium tracking-tight truncate">
                StayDirect • Zero Brokerage
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Role Toggle, Location, Notifications, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Toggle Switcher */}
          <button
            onClick={onToggleRole}
            title="Switch between Student and Owner View"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 border border-[#B4EFDA] bg-[#E8F5EE] text-[#006C49] hover:bg-[#B4EFDA]/40"
          >
            <span className="material-symbols-outlined text-[15px]">
              {userRole === 'student' ? 'school' : 'domain'}
            </span>
            <span className="hidden xs:inline">
              {userRole === 'student' ? 'Student' : 'Owner'}
            </span>
          </button>

          {/* Location Badge */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F0F3FF] px-2.5 py-1 rounded-full text-[#00362A] text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px] text-[#006C49]">location_on</span>
            <span>Pune</span>
          </div>

          {/* Mobile App Install Button */}
          {onOpenAppModal && (
            <button
              onClick={onOpenAppModal}
              title="Get StayDirect Mobile App"
              className="flex items-center gap-1 bg-[#E8F5EE] border border-[#B4EFDA] px-2.5 py-1 rounded-full text-[#006C49] text-xs font-semibold hover:bg-[#B4EFDA]/50 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">smartphone</span>
              <span className="hidden xs:inline">App</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#404945] hover:text-[#00362A] hover:bg-[#F0F3FF] transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BA1A1A] rounded-full ring-2 ring-white"></span>
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            aria-label="Profile"
            className="w-8 h-8 rounded-full bg-[#00362A] text-white flex items-center justify-center shrink-0 hover:ring-2 hover:ring-[#006C49] transition-all overflow-hidden"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
