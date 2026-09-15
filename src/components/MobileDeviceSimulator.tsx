import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
  userRole: UserRole;
  onToggleRole: () => void;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onCloseSimulator: () => void;
  onOpenAppModal: () => void;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  children,
  userRole,
  onToggleRole,
  currentScreen,
  onNavigate,
  onCloseSimulator,
  onOpenAppModal,
}) => {
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [scale, setScale] = useState<number>(0.92);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://staydirect.pune';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    appUrl
  )}`;

  return (
    <div className="relative min-h-screen bg-radial from-[#1E293B] via-[#0F172A] to-[#020617] text-white flex flex-col items-center justify-start p-3 sm:p-6 overflow-x-hidden">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 z-40 mb-4 sm:mb-6">
        {/* Brand & Mode Label */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#006C49] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-tight">
                Mobile App Simulator
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#B4EFDA] text-[#00362A] text-[10px] font-extrabold uppercase tracking-wide">
                Live Preview
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Interactive Pune student & owner app experience
            </p>
          </div>
        </div>

        {/* Center: Device & Role Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Device Model Selector */}
          <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => setDeviceType('iphone')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceType === 'iphone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">phone_iphone</span>
              <span className="hidden sm:inline">iPhone 16 Pro</span>
              <span className="sm:hidden">iOS</span>
            </button>
            <button
              onClick={() => setDeviceType('android')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceType === 'android'
                  ? 'bg-[#006C49] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">android</span>
              <span className="hidden sm:inline">Pixel 9 (Android)</span>
              <span className="sm:hidden">Android</span>
            </button>
          </div>

          {/* User Role Toggle */}
          <button
            onClick={onToggleRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E8F5EE] text-[#00362A] hover:bg-[#B4EFDA] transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              {userRole === 'student' ? 'school' : 'domain'}
            </span>
            <span>{userRole === 'student' ? 'Student Mode' : 'Owner Hub'}</span>
          </button>

          {/* Scale presets */}
          <div className="hidden md:flex items-center bg-black/40 px-1 py-0.5 rounded-xl border border-white/10 text-xs text-slate-300">
            <button
              onClick={() => setScale(0.85)}
              className={`px-2 py-1 rounded-lg ${scale === 0.85 ? 'bg-white/20 text-white font-bold' : 'hover:text-white'}`}
            >
              85%
            </button>
            <button
              onClick={() => setScale(0.92)}
              className={`px-2 py-1 rounded-lg ${scale === 0.92 ? 'bg-white/20 text-white font-bold' : 'hover:text-white'}`}
            >
              92%
            </button>
            <button
              onClick={() => setScale(1.0)}
              className={`px-2 py-1 rounded-lg ${scale === 1.0 ? 'bg-white/20 text-white font-bold' : 'hover:text-white'}`}
            >
              100%
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Test on Physical Phone */}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm active:scale-95"
            title="Scan QR Code to open directly on your mobile device"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span className="hidden sm:inline">Phone QR</span>
          </button>

          {/* Expo Code Modal */}
          <button
            onClick={onOpenAppModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#006C49] text-white hover:bg-[#124E3F] transition-all shadow-sm active:scale-95"
            title="React Native & Expo Setup"
          >
            <span className="material-symbols-outlined text-[16px]">code_blocks</span>
            <span className="hidden sm:inline">React Native Code</span>
          </button>

          {/* Exit Simulator Button */}
          <button
            onClick={onCloseSimulator}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Switch back to Responsive Web Mode"
          >
            <span className="material-symbols-outlined text-[20px]">fullscreen_exit</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Area */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 my-auto">
        {/* Left Side Quick Jump Panel (Desktop/Tablet) */}
        <div className="hidden lg:flex flex-col gap-3 w-64 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl shrink-0">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <span className="material-symbols-outlined text-[#B4EFDA] text-[18px]">
              touch_app
            </span>
            <span className="text-xs font-extrabold tracking-wide uppercase text-slate-200">
              Interactive Screens
            </span>
          </div>

          {/* Screen Buttons for Student */}
          {userRole === 'student' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Student Discovery
              </span>
              {[
                { id: 'student-home', label: 'Home Feed', icon: 'home' },
                { id: 'search', label: 'Search & Filters', icon: 'search' },
                { id: 'saved', label: 'Saved Hostels', icon: 'favorite' },
                { id: 'map', label: 'Pune Map View', icon: 'map' },
                { id: 'profile', label: 'Student Profile', icon: 'person' },
                { id: 'chat', label: 'Direct Owner Chat', icon: 'chat' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    currentScreen === s.id
                      ? 'bg-[#006C49] text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Screen Buttons for Owner */}
          {userRole === 'owner' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Owner Management
              </span>
              {[
                { id: 'owner-home', label: 'Owner Dashboard', icon: 'grid_view' },
                { id: 'owner-listings', label: 'My Hostels & Rates', icon: 'apartment' },
                { id: 'owner-inquiries', label: 'Student Inquiries', icon: 'forum' },
                { id: 'add-hostel', label: 'Add New Property', icon: 'add_circle' },
                { id: 'profile', label: 'Owner Settings', icon: 'manage_accounts' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    currentScreen === s.id
                      ? 'bg-[#006C49] text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Switch Role Quick Link */}
          <div className="pt-3 border-t border-white/10 mt-2">
            <button
              onClick={onToggleRole}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[#B4EFDA] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>Switch to {userRole === 'student' ? 'Owner Hub' : 'Student Mode'}</span>
            </button>
          </div>
        </div>

        {/* CENTER: The Realistic Smartphone Bezel */}
        <div
          className="relative transition-transform duration-300 ease-out shrink-0"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Side Hardware Buttons (Left side: Volume + Action) */}
          <div className="absolute -left-3 top-24 w-1.5 h-10 bg-slate-700 rounded-l-md shadow-xs"></div>
          <div className="absolute -left-3 top-38 w-1.5 h-12 bg-slate-700 rounded-l-md shadow-xs"></div>
          <div className="absolute -left-3 top-54 w-1.5 h-12 bg-slate-700 rounded-l-md shadow-xs"></div>

          {/* Side Hardware Buttons (Right side: Power) */}
          <div className="absolute -right-3 top-32 w-1.5 h-16 bg-slate-700 rounded-r-md shadow-xs"></div>

          {/* Outer Phone Shell */}
          <div
            className={`relative w-[390px] h-[830px] bg-[#121824] rounded-[52px] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.85)] border-4 ${
              deviceType === 'iphone' ? 'border-[#334155]' : 'border-[#475569]'
            }`}
          >
            {/* Inner Phone Screen */}
            <div
              className="relative w-full h-full bg-[#F8FAF9] text-[#111C2D] rounded-[42px] overflow-hidden flex flex-col shadow-inner select-none"
              style={{ transform: 'translateZ(0)' }}
            >
              {/* TOP STATUS BAR */}
              <div className="relative h-11 w-full bg-[#F8FAF9] px-6 flex items-center justify-between text-slate-800 shrink-0 z-50 select-none">
                {/* Time */}
                <span className="text-[13px] font-bold tracking-tight text-[#111C2D]">
                  {currentTime}
                </span>

                {/* iPhone Dynamic Island OR Android Punch Hole */}
                {deviceType === 'iphone' ? (
                  <div
                    onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                    className={`cursor-pointer transition-all duration-300 bg-black text-white flex items-center justify-between px-3 rounded-full ${
                      dynamicIslandExpanded ? 'w-48 h-8' : 'w-26 h-6'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
                      <span className="text-[9px] font-extrabold text-[#B4EFDA] tracking-wider uppercase">
                        StayDirect
                      </span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700 mx-auto"></div>
                )}

                {/* Status Icons */}
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-[10px] font-bold">5G</span>
                  <span className="material-symbols-outlined text-[14px]">wifi</span>
                  <span className="material-symbols-outlined text-[16px] text-[#006C49]">
                    battery_charging_full
                  </span>
                </div>
              </div>

              {/* Internal Screen Content (Scrollable) */}
              <div
                id="phone-screen-viewport"
                className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#F8FAF9] pb-4"
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {children}
              </div>

              {/* Bottom Gesture Bar / Home Indicator */}
              <div className="relative h-5 w-full bg-[#F8FAF9] flex items-center justify-center shrink-0 z-40">
                <div
                  className={`rounded-full transition-all ${
                    deviceType === 'iphone' ? 'w-32 h-1 bg-slate-900/60' : 'w-20 h-1 bg-slate-800/40'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Info & Features Card (Desktop/Tablet) */}
        <div className="hidden lg:flex flex-col gap-4 w-72 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#B4EFDA] text-[20px]">
              verified_user
            </span>
            <span className="text-xs font-extrabold text-white">Pune Student PG Platform</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            You are previewing <strong>StayDirect</strong> in native mobile mode with 100% live touch interactions, Pune area filters, and zero brokerage direct bookings.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#B4EFDA] text-[18px] shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <strong className="text-white block font-bold">Zero Brokerage Guarantee</strong>
                <span className="text-[11px] text-slate-300">
                  Connect directly with PG owners via Call or WhatsApp.
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#B4EFDA] text-[18px] shrink-0 mt-0.5">
                speed
              </span>
              <div>
                <strong className="text-white block font-bold">Native 60fps Experience</strong>
                <span className="text-[11px] text-slate-300">
                  Built in React Native Expo & modern responsive web.
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#B4EFDA] text-[18px] shrink-0 mt-0.5">
                location_city
              </span>
              <div>
                <strong className="text-white block font-bold">Pune Localized</strong>
                <span className="text-[11px] text-slate-300">
                  FC Road, Kothrud, Hinjewadi, Viman Nagar, Wakad.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowQRModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#006C49] hover:bg-[#124E3F] text-white text-xs font-bold transition-all shadow-md active:scale-95 mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">smartphone</span>
            <span>Open on Your Real Phone</span>
          </button>
        </div>
      </div>

      {/* QR Code Modal for Physical Device Testing */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-slate-900 shadow-2xl text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#006C49] text-white mx-auto flex items-center justify-center mb-3 shadow-md">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900">
              Open on Your Physical Phone
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Point your smartphone camera at this QR code to test StayDirect instantly in Safari or Chrome.
            </p>

            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={qrCodeUrl}
                alt="Scan to open StayDirect on mobile phone"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Supports full-screen PWA installation with offline caching and native gestures!
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(appUrl);
                  alert('App URL copied to clipboard!');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#006C49] hover:bg-[#124E3F] text-xs font-bold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
