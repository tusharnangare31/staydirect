import React from 'react';
import { UserProfile } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (role?: 'student' | 'owner', context?: string) => void;
  onLogout: () => void;
  onOpenAppModal?: () => void;
  savedCount?: number;
  unreadInquiriesCount?: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAppModal,
  savedCount = 0,
  unreadInquiriesCount = 0,
}) => {
  if (!isOpen) return null;

  const handleNav = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  const isGuest = !currentUser;
  const isStudent = currentUser?.role === 'student';
  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111C2D]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className="relative w-[85%] max-w-[340px] bg-white h-full shadow-2xl flex flex-col justify-between pt-6 pb-6 px-5 rounded-r-[28px] z-10 overflow-hidden animate-in slide-in-from-left duration-300 border-r border-[#E5E3D8]"
        role="dialog"
        aria-label="Navigation drawer"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E5E3D8]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-[#00362A]/20 shrink-0">
                  <img
                    src="/icon.svg"
                    alt="StayDirect Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-black tracking-tight text-[#111C2D]">
                  Stay<span className="text-[#173B2C]">Direct</span>
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#15803D] mt-1 pl-0.5 tracking-tight flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                <span>Zero Brokerage • Pune Hostels & PGs</span>
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Menu"
              className="p-1.5 text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F1EFE6] active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Account / Identity Card */}
          <div className="mt-4 p-3 rounded-2xl bg-[#F8F7F1] border border-[#E5E3D8]">
            {isGuest ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5E3D8] text-[#5C6470] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">person_outline</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-[#111C2D]">Guest Visitor</span>
                    <span className="block text-[10px] text-[#5C6470]">Browsing Pune hostels</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('student', 'Sign in as a student to shortlist hostels, chat with owners & schedule visits.');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#173B2C] hover:bg-[#24523F] text-white text-xs font-bold text-center transition-all cursor-pointer"
                  >
                    Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('owner', 'Sign in as a hostel owner to list rooms and manage inquiries with zero brokerage.');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-white border border-[#B8CEAA] hover:bg-[#DCFCE7] text-[#15803D] text-xs font-bold text-center transition-all cursor-pointer"
                  >
                    Owner Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isStudent
                        ? 'bg-[#DCFCE7] text-[#15803D] ring-1 ring-[#B8CEAA]'
                        : 'bg-[#173B2C] text-white'
                    }`}
                  >
                    {isStudent ? (
                      currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">domain</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-[#111C2D] truncate">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-[#5C6470] truncate">
                      {isStudent
                        ? currentUser.college || 'Student'
                        : currentUser.propertyBusinessName || 'Hostel Owner'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  title="Sign Out"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  aria-label="Sign out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-1">
            {/* 1. Universal / Student Home */}
            <button
              onClick={() => handleNav(isOwner ? 'owner-home' : 'student-home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'student-home' || activeScreen === 'owner-home'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isOwner ? 'dashboard' : 'explore'}
              </span>
              <span>{isOwner ? 'Owner Dashboard' : 'Explore Hostels'}</span>
            </button>

            {/* Search */}
            <button
              onClick={() => handleNav('search')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'search'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>Search Hostels & PGs</span>
            </button>

            {/* Pune Map */}
            <button
              onClick={() => handleNav('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'map'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              <span>Pune Locality Map</span>
            </button>

            {/* OWNER EXCLUSIVE LINKS */}
            {isOwner && (
              <>
                <div className="pt-2 pb-1 px-3.5 text-[10px] font-extrabold uppercase tracking-wider text-[#8E95A2]">
                  Hostel Management
                </div>

                <button
                  onClick={() => handleNav('owner-listings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeScreen === 'owner-listings'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                  <span>My Hostel Listings</span>
                </button>

                <button
                  onClick={() => handleNav('add-hostel')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeScreen === 'add-hostel'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Add New Listing</span>
                </button>

                <button
                  onClick={() => handleNav('owner-inquiries')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeScreen === 'owner-inquiries'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                    <span>Student Inquiries</span>
                  </div>
                  {unreadInquiriesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black">
                      {unreadInquiriesCount} new
                    </span>
                  )}
                </button>
              </>
            )}

            {/* STUDENT & GUEST LINKS */}
            {!isOwner && (
              <>
                <button
                  onClick={() => handleNav('saved')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeScreen === 'saved'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                    <span>Saved Shortlist</span>
                  </div>
                  {savedCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#173B2C] text-white text-[9px] font-black">
                      {savedCount}
                    </span>
                  )}
                </button>

                {isStudent && (
                  <button
                    onClick={() => handleNav('chat')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeScreen === 'chat'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <span>Messages & Visits</span>
                  </button>
                )}
              </>
            )}

            {/* Profile */}
            <button
              onClick={() => handleNav('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'profile'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>{isOwner ? 'Owner Settings' : isStudent ? 'Student Profile' : 'Guest Preferences'}</span>
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'about'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Zero Brokerage Guarantee</span>
            </button>

            <button
              onClick={() => handleNav('help')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'help'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'text-[#5C6470] hover:text-[#111C2D] hover:bg-[#F8F7F1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span>Help & Support</span>
            </button>

            {onOpenAppModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppModal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#15803D] bg-[#DCFCE7]/60 hover:bg-[#DCFCE7] transition-all border border-[#B8CEAA] my-1 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">smartphone</span>
                  <span>Install App / APK</span>
                </div>
                <span className="text-[10px] bg-[#173B2C] text-white px-1.5 py-0.2 rounded-md font-bold">
                  Free
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-[#E5E3D8] flex flex-col space-y-2 shrink-0">
          <div className="flex items-center gap-2 text-[#5C6470] text-xs font-bold">
            <span className="material-symbols-outlined text-[#173B2C] text-[16px]">location_on</span>
            <span>Pune, Maharashtra • 0% Brokerage</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8E95A2]">
            <span>StayDirect v2.0 Production</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#B8CEAA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse"></span>
              Verified
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
