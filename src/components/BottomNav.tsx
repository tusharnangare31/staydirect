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
  unreadInquiriesCount = 0,
  isEmbedded = false,
}) => {
  const containerClass = `${
    isEmbedded
      ? 'sticky bottom-0 left-0 right-0 z-30'
      : 'fixed bottom-0 left-0 right-0 z-40 md:hidden'
  } bg-white/95 backdrop-blur-xl border-t border-[#E5E3D8] shadow-[0_-4px_24px_rgba(0,0,0,0.07)] pb-[env(safe-area-inset-bottom)]`;

  // 1. GUEST BOTTOM NAVIGATION
  if (userRole === 'guest') {
    return (
      <nav className={containerClass} aria-label="Guest Bottom Navigation">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          {/* Explore / Home */}
          <button
            onClick={() => onNavigate('student-home')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'student-home'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'student-home' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              explore
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Explore</span>
          </button>

          {/* Search */}
          <button
            onClick={() => onNavigate('search')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'search'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'search' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              search
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Search</span>
          </button>

          {/* Map */}
          <button
            onClick={() => onNavigate('map')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'map'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'map' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              map
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Pune Map</span>
          </button>

          {/* Saved Shortlist */}
          <button
            onClick={() => onNavigate('saved')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors relative cursor-pointer ${
              currentScreen === 'saved'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-[23px]"
                style={{
                  fontVariationSettings: currentScreen === 'saved' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                bookmark
              </span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#173B2C] text-white text-[9px] font-black px-1 rounded-full">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Saved</span>
          </button>

          {/* Sign In CTA */}
          <button
            onClick={() => onNavigate('login')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'login' || currentScreen === 'register'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#15803D] hover:text-[#173B2C]'
            }`}
          >
            <span className="material-symbols-outlined text-[23px]">account_circle</span>
            <span className="text-[10px] mt-0.5 tracking-tight font-black">Sign In</span>
          </button>
        </div>
      </nav>
    );
  }

  // 2. STUDENT BOTTOM NAVIGATION
  if (userRole === 'student') {
    return (
      <nav className={containerClass} aria-label="Student Bottom Navigation">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          {/* Home */}
          <button
            onClick={() => onNavigate('student-home')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'student-home'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'student-home' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              home
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
          </button>

          {/* Search */}
          <button
            onClick={() => onNavigate('search')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'search'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'search' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              search
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Search</span>
          </button>

          {/* Saved */}
          <button
            onClick={() => onNavigate('saved')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors relative cursor-pointer ${
              currentScreen === 'saved'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined text-[23px]"
                style={{
                  fontVariationSettings: currentScreen === 'saved' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                bookmark
              </span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#173B2C] text-white text-[9px] font-black px-1 rounded-full">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Saved</span>
          </button>

          {/* Chat */}
          <button
            onClick={() => onNavigate('chat')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'chat'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'chat' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              chat
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Messages</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
              currentScreen === 'profile'
                ? 'text-[#173B2C] font-extrabold'
                : 'text-[#5C6470] hover:text-[#173B2C]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              account_circle
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Profile</span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. OWNER BOTTOM NAVIGATION
  return (
    <nav className={containerClass} aria-label="Owner Bottom Navigation">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {/* Hub */}
        <button
          onClick={() => onNavigate('owner-home')}
          className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
            currentScreen === 'owner-home'
              ? 'text-[#173B2C] font-extrabold'
              : 'text-[#5C6470] hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{
              fontVariationSettings: currentScreen === 'owner-home' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            dashboard
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Hub</span>
        </button>

        {/* Listings */}
        <button
          onClick={() => onNavigate('owner-listings')}
          className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
            currentScreen === 'owner-listings'
              ? 'text-[#173B2C] font-extrabold'
              : 'text-[#5C6470] hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{
              fontVariationSettings: currentScreen === 'owner-listings' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            apartment
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Listings</span>
        </button>

        {/* Inquiries */}
        <button
          onClick={() => onNavigate('owner-inquiries')}
          className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors relative cursor-pointer ${
            currentScreen === 'owner-inquiries'
              ? 'text-[#173B2C] font-extrabold'
              : 'text-[#5C6470] hover:text-[#173B2C]'
          }`}
        >
          <div className="relative">
            <span
              className="material-symbols-outlined text-[23px]"
              style={{
                fontVariationSettings: currentScreen === 'owner-inquiries' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              forum
            </span>
            {unreadInquiriesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadInquiriesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Inquiries</span>
        </button>

        {/* Add Hostel */}
        <button
          onClick={() => onNavigate('add-hostel')}
          className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
            currentScreen === 'add-hostel'
              ? 'text-[#173B2C] font-extrabold'
              : 'text-[#5C6470] hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{
              fontVariationSettings: currentScreen === 'add-hostel' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            add_circle
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Add</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-12 transition-colors cursor-pointer ${
            currentScreen === 'profile'
              ? 'text-[#173B2C] font-extrabold'
              : 'text-[#5C6470] hover:text-[#173B2C]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{
              fontVariationSettings: currentScreen === 'profile' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            manage_accounts
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Profile</span>
        </button>
      </div>
    </nav>
  );
};
