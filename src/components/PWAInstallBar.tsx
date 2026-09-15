import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface PWAInstallBarProps {
  onOpenAppModal: () => void;
}

export const PWAInstallBar: React.FC<PWAInstallBarProps> = ({ onOpenAppModal }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center p-2 bg-amber-500 text-white text-xs font-bold shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span>Offline Mode Active • Saved hostels & cached data are available without internet.</span>
          </div>
        </div>
      )}

      {/* Floating PWA Install Bar */}
      {!isInstalled && !dismissed && (
        <div className="fixed bottom-18 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 bg-white/95 backdrop-blur-md border border-[#B4EFDA] rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          {/* App Icon + Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00362A] text-[#6CF8BB] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold text-[#111C2D] truncate">
                StayDirect Mobile App
              </span>
              <span className="text-[10px] text-[#006C49] font-semibold truncate">
                Direct Owner Chat • Offline Ready
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isInstallable ? (
              <button
                type="button"
                onClick={() => install()}
                className="px-3 py-1.5 rounded-xl bg-[#00362A] hover:bg-[#124E3F] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                <span>Install</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAppModal}
                className="px-3 py-1.5 rounded-xl bg-[#00362A] hover:bg-[#124E3F] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">smartphone</span>
                <span>Get App</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss install banner"
              className="w-7 h-7 rounded-lg text-[#64748B] hover:bg-[#F0F3FF] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
