import React from 'react';
import { UserRole } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenAppModal?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  userRole,
  onToggleRole,
  onOpenAppModal,
}) => {
  if (!isOpen) return null;

  const handleNav = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111C2D]/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className="relative w-[85%] max-w-[340px] bg-white h-full shadow-2xl flex flex-col justify-between pt-7 pb-6 px-6 rounded-r-[32px] z-10 overflow-hidden animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-label="Navigation drawer"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-[#F0F3FF]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#124E3F] flex items-center justify-center shadow-md text-white">
                  <span className="material-symbols-outlined text-[19px]">home</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-[#124E3F]">
                  Stay<span className="text-[#006C49]">Direct</span>
                </span>
              </div>
              <p className="text-[12px] font-semibold text-[#64748B] mt-1 pl-0.5 tracking-tight">
                Find Your Home. No Brokerage.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Menu"
              className="p-1.5 text-[#64748B] hover:text-[#111C2D] hover:bg-[#F0F3FF] active:scale-95 rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Quick Role Switch Banner inside Drawer */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#F0F3FF] border border-[#D8E3FB] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#006C49] text-[20px]">
                {userRole === 'student' ? 'school' : 'domain'}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#111C2D] truncate">
                  {userRole === 'student' ? 'Student View' : 'Hostel Owner View'}
                </span>
                <span className="text-[10px] text-[#404945]">
                  {userRole === 'student' ? 'Searching hostels in Pune' : 'Managing your properties'}
                </span>
              </div>
            </div>
            <button
              onClick={onToggleRole}
              className="text-xs font-bold text-[#006C49] bg-white px-2.5 py-1 rounded-lg shadow-xs hover:bg-[#B4EFDA]/40 transition-colors shrink-0"
            >
              Switch
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-1">
            <button
              onClick={() => handleNav(userRole === 'student' ? 'student-home' : 'owner-home')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'student-home' || activeScreen === 'owner-home'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">home</span>
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNav('search')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'search'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">search</span>
              <span>Search Hostels</span>
            </button>

            {userRole === 'owner' && (
              <>
                <button
                  onClick={() => handleNav('owner-listings')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                    activeScreen === 'owner-listings'
                      ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                      : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[21px]">apartment</span>
                  <span>My Listings</span>
                </button>

                <button
                  onClick={() => handleNav('add-hostel')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                    activeScreen === 'add-hostel'
                      ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                      : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[21px]">add_circle</span>
                  <span>Add New Hostel</span>
                </button>

                <button
                  onClick={() => handleNav('owner-inquiries')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                    activeScreen === 'owner-inquiries'
                      ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                      : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[21px]">forum</span>
                  <span>Inquiries</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleNav('saved')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'saved'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">favorite</span>
              <span>Saved Hostels</span>
            </button>

            <button
              onClick={() => handleNav('chat')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'chat'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="material-symbols-outlined text-[21px]">chat</span>
                <span>Messages / Chat</span>
              </div>
              <span className="text-xs bg-[#E8F5EE] text-[#006C49] px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </button>

            <button
              onClick={() => handleNav('profile')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'profile'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">person</span>
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleNav('help')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'help'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">help</span>
              <span>Help & Support</span>
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                activeScreen === 'about'
                  ? 'bg-[#E8F5EE] text-[#124E3F] font-bold'
                  : 'text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9]'
              }`}
            >
              <span className="material-symbols-outlined text-[21px]">info</span>
              <span>About StayDirect</span>
            </button>

            {onOpenAppModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppModal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] font-bold text-[#00362A] bg-[#E8F5EE] hover:bg-[#B4EFDA]/50 transition-all border border-[#B4EFDA] my-1 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#006C49]">smartphone</span>
                  <span>Install Mobile App</span>
                </div>
                <span className="text-[10px] bg-[#00362A] text-white px-2 py-0.5 rounded-md font-bold">
                  PWA / APK
                </span>
              </button>
            )}

            <button
              onClick={() => handleNav('landing')}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[15px] font-semibold text-[#475569] hover:text-[#124E3F] hover:bg-[#F8FAF9] transition-all"
            >
              <span className="material-symbols-outlined text-[21px]">explore</span>
              <span>Onboarding Intro</span>
            </button>
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-[#F0F3FF] flex flex-col space-y-2 shrink-0">
          <div className="flex items-center gap-2 text-[#475569] px-1 text-sm font-medium">
            <span className="material-symbols-outlined text-[#006C49] text-[18px]">location_on</span>
            <span>Pune, Maharashtra</span>
          </div>
          <div className="flex items-center justify-between px-1 text-xs text-[#94A3B8] font-medium">
            <span>v1.0.0</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#006C49] bg-[#E8F5EE] px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Verified Platform
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
