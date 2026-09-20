import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

export type WindowStyle = 'iphone' | 'mac' | 'ipad' | 'clean';
export type StudioTheme = 'dark' | 'light' | 'midnight';

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
  const [windowStyle, setWindowStyle] = useState<WindowStyle>('iphone');
  const [studioTheme, setStudioTheme] = useState<StudioTheme>('dark');
  const [scale, setScale] = useState<number>(0.95);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
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

  // Background styling based on studio theme
  const getStudioBgClass = () => {
    if (studioTheme === 'light') {
      return 'bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1] text-slate-800';
    }
    if (studioTheme === 'midnight') {
      return 'bg-radial from-[#13111C] via-[#0A0713] to-[#040208] text-white';
    }
    return 'bg-radial from-[#1E293B] via-[#0F172A] to-[#020617] text-white';
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-5 overflow-x-hidden transition-colors duration-500 ${getStudioBgClass()}`}
    >
      {/* 1. Sleek Floating Window Control Bar */}
      <header
        className={`w-full max-w-5xl rounded-2xl px-3 sm:px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 z-40 mb-4 sm:mb-6 transition-all ${
          studioTheme === 'light'
            ? 'bg-white/80 backdrop-blur-xl border border-slate-300/80 text-slate-800 shadow-slate-300/50'
            : 'bg-white/10 backdrop-blur-xl border border-white/15 text-white shadow-black/40'
        }`}
      >
        {/* Left: Brand Identity & Window Style Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00362A] to-[#006C49] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[18px]">home_pin</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight">StayDirect</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#006C49] text-[10px] font-black uppercase tracking-wide">
                App Window
              </span>
            </div>
            <p
              className={`text-[11px] font-medium ${
                studioTheme === 'light' ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {windowStyle === 'iphone'
                ? 'iPhone 16 Pro Mobile Frame'
                : windowStyle === 'mac'
                ? 'macOS Application Window'
                : windowStyle === 'ipad'
                ? 'iPad Pro Tablet Frame'
                : 'Clean Frameless Window'}
            </p>
          </div>
        </div>

        {/* Center: Window Style Switcher (Key Request: Change Window That Represents App) */}
        <div
          className={`flex items-center p-1 rounded-xl border ${
            studioTheme === 'light'
              ? 'bg-slate-100 border-slate-200'
              : 'bg-black/40 border-white/10'
          }`}
        >
          {/* iPhone Mobile Window */}
          <button
            onClick={() => setWindowStyle('iphone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              windowStyle === 'iphone'
                ? 'bg-[#006C49] text-white shadow-md'
                : studioTheme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Switch to Mobile Phone Window"
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span className="hidden sm:inline">Phone</span>
          </button>

          {/* macOS Desktop App Window */}
          <button
            onClick={() => setWindowStyle('mac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              windowStyle === 'mac'
                ? 'bg-[#006C49] text-white shadow-md'
                : studioTheme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Switch to macOS Desktop App Window"
          >
            <span className="material-symbols-outlined text-[16px]">laptop_mac</span>
            <span className="hidden sm:inline">Mac Window</span>
          </button>

          {/* iPad Tablet Window */}
          <button
            onClick={() => setWindowStyle('ipad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              windowStyle === 'ipad'
                ? 'bg-[#006C49] text-white shadow-md'
                : studioTheme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Switch to Tablet Window"
          >
            <span className="material-symbols-outlined text-[16px]">tablet_mac</span>
            <span className="hidden sm:inline">Tablet</span>
          </button>

          {/* Clean Frameless Window */}
          <button
            onClick={() => setWindowStyle('clean')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              windowStyle === 'clean'
                ? 'bg-[#006C49] text-white shadow-md'
                : studioTheme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Switch to Minimal Frameless Window"
          >
            <span className="material-symbols-outlined text-[16px]">crop_free</span>
            <span className="hidden sm:inline">Minimal</span>
          </button>
        </div>

        {/* Right: Quick Controls (Role Toggle, Scale, Backdrop, QR) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Toggle Pill */}
          <button
            onClick={onToggleRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-[#006C49] border border-emerald-500/30 hover:bg-[#006C49] hover:text-white transition-all shadow-xs active:scale-95"
            title="Toggle between Student and Owner View"
          >
            <span className="material-symbols-outlined text-[16px]">
              {userRole === 'student' ? 'school' : 'domain'}
            </span>
            <span>{userRole === 'student' ? 'Student' : 'Owner'}</span>
          </button>

          {/* Scale Control */}
          <div
            className={`hidden md:flex items-center px-1 py-0.5 rounded-xl border text-xs font-bold ${
              studioTheme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-black/40 border-white/10 text-slate-300'
            }`}
          >
            {[0.85, 0.95, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  scale === s
                    ? 'bg-[#006C49] text-white'
                    : studioTheme === 'light'
                    ? 'hover:text-slate-900'
                    : 'hover:text-white'
                }`}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>

          {/* Studio Backdrop Toggle */}
          <button
            onClick={() =>
              setStudioTheme((prev) =>
                prev === 'dark' ? 'light' : prev === 'light' ? 'midnight' : 'dark'
              )
            }
            className={`p-1.5 rounded-xl border transition-colors ${
              studioTheme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Switch Studio Lighting / Backdrop Theme"
          >
            <span className="material-symbols-outlined text-[18px]">
              {studioTheme === 'light'
                ? 'light_mode'
                : studioTheme === 'midnight'
                ? 'bedtime'
                : 'dark_mode'}
            </span>
          </button>

          {/* Test on Physical Phone (QR Code) */}
          <button
            onClick={() => setShowQRModal(true)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              studioTheme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
            title="Open on real phone with QR Code"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span className="hidden sm:inline">Phone QR</span>
          </button>

          {/* Exit Window Frame (Fullscreen Web Mode) */}
          <button
            onClick={onCloseSimulator}
            className={`p-1.5 rounded-xl border transition-colors ${
              studioTheme === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-white/10 border-white/15 text-slate-300 hover:text-white hover:bg-white/20'
            }`}
            title="Expand to Full Web Mode"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen_exit</span>
          </button>
        </div>
      </header>

      {/* 2. THE WINDOW THAT REPRESENTS THE APP (Centered Hero Element) */}
      <div
        className="w-full flex-1 flex items-center justify-center my-auto transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* ============================================================ */}
        {/* OPTION A: iPhone 16 Pro Window Frame */}
        {/* ============================================================ */}
        {windowStyle === 'iphone' && (
          <div className="relative transition-all duration-300 ease-out">
            {/* Side Hardware Buttons */}
            <div className="absolute -left-3 top-24 w-1.5 h-10 bg-slate-700 rounded-l-md shadow-xs" />
            <div className="absolute -left-3 top-38 w-1.5 h-12 bg-slate-700 rounded-l-md shadow-xs" />
            <div className="absolute -left-3 top-54 w-1.5 h-12 bg-slate-700 rounded-l-md shadow-xs" />
            <div className="absolute -right-3 top-32 w-1.5 h-16 bg-slate-700 rounded-r-md shadow-xs" />

            {/* Phone Outer Titanium Shell */}
            <div className="relative w-[390px] h-[840px] bg-[#121824] rounded-[52px] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.85)] border-4 border-[#334155]">
              {/* Inner Screen Bezel */}
              <div
                className="relative w-full h-full bg-[#F8FAF9] text-[#02060C] rounded-[42px] overflow-hidden flex flex-col shadow-inner select-none"
                style={{ transform: 'translateZ(0)' }}
              >
                {/* iOS Dynamic Status Bar */}
                <div className="relative h-11 w-full bg-[#F8FAF9] px-6 flex items-center justify-between text-slate-800 shrink-0 z-50 select-none">
                  {/* Time */}
                  <span className="text-[13px] font-bold tracking-tight text-[#02060C]">
                    {currentTime}
                  </span>

                  {/* Interactive Dynamic Island */}
                  <div
                    onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                    className={`cursor-pointer transition-all duration-300 bg-black text-white flex items-center justify-between px-3 rounded-full shadow-md ${
                      dynamicIslandExpanded ? 'w-48 h-8' : 'w-26 h-6'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#006C49] animate-pulse" />
                      <span className="text-[9px] font-black text-white tracking-wider uppercase">
                        {dynamicIslandExpanded ? 'StayDirect Pune' : 'StayDirect'}
                      </span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                  </div>

                  {/* Status Icons */}
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] font-black">5G</span>
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    <span className="material-symbols-outlined text-[16px] text-[#11883B]">
                      battery_charging_full
                    </span>
                  </div>
                </div>

                {/* Inner Mobile Viewport (Scrollable with hidden scrollbar) */}
                <div
                  id="phone-viewport"
                  className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#F8FAF9] no-scrollbar flex flex-col"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {children}
                </div>

                {/* Bottom Gesture Bar / Home Indicator */}
                <div className="relative h-5 w-full bg-[#F8FAF9] flex items-center justify-center shrink-0 z-40 border-t border-gray-100">
                  <div className="w-32 h-1 bg-slate-900/60 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION B: macOS Desktop App Window */}
        {/* ============================================================ */}
        {windowStyle === 'mac' && (
          <div className="w-full max-w-[1060px] h-[820px] bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.7)] border border-slate-200/80 flex flex-col overflow-hidden animate-fadeIn">
            {/* macOS Window Header Bar */}
            <div className="h-11 w-full bg-gradient-to-b from-[#F3F4F6] to-[#E5E7EB] border-b border-gray-300 px-4 flex items-center justify-between shrink-0 select-none">
              {/* Traffic Light Buttons (macOS Signature) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onCloseSimulator}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 active:opacity-60 transition-opacity flex items-center justify-center group"
                  title="Close Window"
                >
                  <span className="material-symbols-outlined text-[9px] text-red-950 opacity-0 group-hover:opacity-100">
                    close
                  </span>
                </button>
                <button
                  onClick={() => setScale(0.85)}
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 active:opacity-60 transition-opacity flex items-center justify-center group"
                  title="Minimize Window"
                >
                  <span className="material-symbols-outlined text-[9px] text-amber-950 opacity-0 group-hover:opacity-100">
                    remove
                  </span>
                </button>
                <button
                  onClick={() => setScale(1.0)}
                  className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 active:opacity-60 transition-opacity flex items-center justify-center group"
                  title="Maximize Window"
                >
                  <span className="material-symbols-outlined text-[9px] text-green-950 opacity-0 group-hover:opacity-100">
                    expand_less
                  </span>
                </button>
              </div>

              {/* Centered macOS Address & App Title Bar */}
              <div className="flex items-center gap-2 bg-white/90 border border-gray-300/80 px-3.5 py-1 rounded-lg text-xs shadow-inner min-w-[280px] sm:min-w-[400px] justify-center">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                <span className="font-bold text-[#02060C]">staydirect.pune.in</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500 capitalize">{currentScreen.replace('-', ' ')}</span>
              </div>

              {/* Right: Quick App Indicators */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 hidden sm:inline">
                  StayDirect Desktop v2.4
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Inner Mac App Window Content */}
            <div className="relative flex-1 w-full overflow-y-auto bg-[#F8FAF9] flex flex-col">
              {children}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION C: iPad Pro Tablet Window */}
        {/* ============================================================ */}
        {windowStyle === 'ipad' && (
          <div className="relative transition-all duration-300 ease-out">
            <div className="relative w-[760px] h-[830px] bg-[#1A202C] rounded-[42px] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.85)] border-4 border-[#3A4252]">
              {/* Inner Tablet Screen */}
              <div className="relative w-full h-full bg-[#F8FAF9] text-[#02060C] rounded-[30px] overflow-hidden flex flex-col shadow-inner select-none">
                {/* Tablet Status Bar */}
                <div className="h-9 w-full bg-[#F8FAF9] px-6 flex items-center justify-between text-slate-800 shrink-0 z-50">
                  <span className="text-xs font-bold text-[#02060C]">{currentTime}</span>

                  {/* Camera Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700" />

                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] font-bold">Wi-Fi</span>
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      battery_full
                    </span>
                  </div>
                </div>

                {/* Tablet Viewport */}
                <div className="relative flex-1 w-full overflow-y-auto bg-[#F8FAF9] flex flex-col">
                  {children}
                </div>

                {/* Tablet Home Bar */}
                <div className="h-4 w-full bg-[#F8FAF9] flex items-center justify-center shrink-0 border-t border-gray-100">
                  <div className="w-40 h-1 bg-slate-900/60 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION D: Clean Minimalist Window */}
        {/* ============================================================ */}
        {windowStyle === 'clean' && (
          <div className="w-full max-w-4xl h-[820px] bg-white rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
            {/* Minimal Window Bar */}
            <div className="h-9 w-full bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <span className="text-xs font-bold text-gray-700">StayDirect Window</span>
              <div className="w-6" />
            </div>

            {/* Minimal Viewport */}
            <div className="relative flex-1 w-full overflow-y-auto bg-[#F8FAF9] flex flex-col">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* 3. Physical Phone QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
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

            <h3 className="text-base font-black text-slate-900">
              Scan with Your Phone Camera
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Open StayDirect instantly on your iOS or Android phone to test live touch interactions and zero-brokerage hostel bookings.
            </p>

            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={qrCodeUrl}
                alt="Scan QR code to open StayDirect on mobile phone"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(appUrl);
                  alert('App URL copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#006C49] hover:bg-[#00362A] text-xs font-bold text-white transition-colors"
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
