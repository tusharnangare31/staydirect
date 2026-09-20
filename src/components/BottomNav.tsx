import React from 'react';
import { UserRole } from '../types';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole: UserRole;
  savedCount: number;
  unreadInquiriesCount?: number;
  isEmbedded?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  userRole,
  savedCount,
  unreadInquiriesCount = 3,
  isEmbedded = false,
}) => {
  const containerClass = `${
    isEmbedded
      ? 'sticky bottom-0 left-0 right-0 z-30'
      : 'fixed bottom-0 left-0 right-0 z-40 md:hidden'
  } bg-white/98 backdrop-blur-xl border-t border-[#E5E3D8] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]`;

  if (userRole === 'student') {
    return (
      <nav className={containerClass} aria-label="Bottom Navigation">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
          {/* Home */}
          <button
            onClick={() => onNavigate('student-home')}
            className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
              currentScreen === 'student-home'
                ? 'text-[#173B2C] font-bold'
                : 'text-gray-500 hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: currentScreen === 'student-home' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              home
            </span>
            <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Search */}
          <button
            onClick={() => onNavigate('search')}
            className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
              currentScreen === 'search'
                ? 'text-[#173B2C] font-bold'
                : 'text-gray-500 hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: currentScreen === 'search' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              search
            </span>
            <span className="text-[11px] mt-0.5 tracking-tight">Search</span>
          </button>

          {/* Saved */}
          <button
            onClick={() => onNavigate('saved')}
            className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors relative ${
              currentScreen === 'saved'
                ? 'text-[#173B2C] font-bold'
                : 'text-gray-500 hover:text-[#173B2C]'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{
                  fontVariationSettings: currentScreen === 'saved' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                bookmark
              </span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#173B2C] text-white text-[9px] font-bold px-1 rounded-full">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Saved</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
              currentScreen === 'profile'
                ? 'text-[#173B2C] font-bold'
                : 'text-gray-500 hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              account_circle
            </span>
            <span className="text-[11px] mt-0.5 tracking-tight">Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  // Owner Bottom Nav
  return (
    <nav className={containerClass} aria-label="Owner Bottom Navigation">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {/* Home */}
        <button
          onClick={() => onNavigate('owner-home')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
            currentScreen === 'owner-home'
              ? 'text-[#173B2C] font-bold'
              : 'text-gray-500 hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentScreen === 'owner-home' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            home
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Listings */}
        <button
          onClick={() => onNavigate('owner-listings')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
            currentScreen === 'owner-listings'
              ? 'text-[#173B2C] font-bold'
              : 'text-gray-500 hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentScreen === 'owner-listings' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            list_alt
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">Listings</span>
        </button>

        {/* Inquiries */}
        <button
          onClick={() => onNavigate('owner-inquiries')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors relative ${
            currentScreen === 'owner-inquiries'
              ? 'text-[#173B2C] font-bold'
              : 'text-gray-500 hover:text-[#173B2C]'
          }`}
        >
          <div className="relative">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: currentScreen === 'owner-inquiries' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              forum
            </span>
            {unreadInquiriesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#15803D] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Inquiries</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
            currentScreen === 'profile'
              ? 'text-[#173B2C] font-bold'
              : 'text-gray-500 hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={{
              fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            person
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
