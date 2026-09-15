import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobileFrameActive: boolean;
  onToggleMobileFrame: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({
  isOpen,
  onClose,
  isMobileFrameActive,
  onToggleMobileFrame,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'react-native' | 'pwa' | 'native'>('react-native');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullRNCode, setShowFullRNCode] = useState(false);

  if (!isOpen) return null;

  const expoQuickCommand = `npx create-expo-app StayDirect && cd StayDirect
npx expo install @expo/vector-icons
# (Replace App.tsx with StayDirect code)
npx expo start`;

  const capacitorCommand = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "StayDirect" "com.staydirect.pune" --web-dir "dist"
npm run build
npx cap add android
npx cap open android`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(capacitorCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reactNativeAppSnippet = `// StayDirect Pune - 100% Native React Native App
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar,
  FlatList, TouchableOpacity, TextInput, Image, Modal,
  ScrollView, Linking, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Core screens: Hostels feed, FC Road / Kothrud filters,
// direct WhatsApp owner connect, Zero Brokerage Badges.
// Located in /react-native-staydirect/App.tsx`;

  const handleCopyExpo = () => {
    navigator.clipboard.writeText(expoQuickCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyRNCode = async () => {
    try {
      const res = await fetch('/react-native-staydirect/App.tsx');
      const text = await res.text();
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      navigator.clipboard.writeText(reactNativeAppSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-[#111C2D]/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F0F3FF]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00362A] text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[26px]">smartphone</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#111C2D]">StayDirect Mobile App</h2>
              <p className="text-xs text-[#64748B]">Install or run on Android & iOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F0F3FF] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Viewport Frame Toggle (Interactive Demo) */}
        <div className="mt-3.5 p-3 rounded-2xl bg-[#F0F3FF] border border-[#DEE8FF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#006C49] text-[22px]">
              ad_units
            </span>
            <div>
              <span className="text-xs font-bold text-[#111C2D] block">Mobile Phone Device Frame</span>
              <span className="text-[10px] text-[#64748B]">
                {isMobileFrameActive ? 'Previewing inside smartphone mockup' : 'Currently full responsive view'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMobileFrame}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isMobileFrameActive
                ? 'bg-[#00362A] text-white'
                : 'bg-white border border-[#CBD5E1] text-[#111C2D] hover:bg-[#E2E8F0]'
            }`}
          >
            {isMobileFrameActive ? 'Disable Frame' : 'Enable Frame'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 bg-[#F8FAF9] rounded-2xl mt-4 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab('react-native')}
            className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
              activeTab === 'react-native'
                ? 'bg-white text-[#00362A] shadow-xs'
                : 'text-[#64748B] hover:text-[#111C2D]'
            }`}
          >
            React Native
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
              activeTab === 'pwa'
                ? 'bg-white text-[#00362A] shadow-xs'
                : 'text-[#64748B] hover:text-[#111C2D]'
            }`}
          >
            Instant PWA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
              activeTab === 'native'
                ? 'bg-white text-[#00362A] shadow-xs'
                : 'text-[#64748B] hover:text-[#111C2D]'
            }`}
          >
            Android APK
          </button>
        </div>

        {/* TAB: React Native (Expo) */}
        {activeTab === 'react-native' && (
          <div className="flex flex-col gap-3.5 mt-4 text-xs">
            <div className="bg-[#E8F5EE] border border-[#B4EFDA] rounded-2xl p-3.5 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#006C49] text-[24px] shrink-0 mt-0.5">
                code_blocks
              </span>
              <div className="text-xs">
                <span className="font-bold text-[#00362A] block">100% Native React Native Code</span>
                <p className="text-[#404945] text-[11px] mt-0.5 leading-relaxed">
                  We've generated the complete native React Native (Expo) codebase in <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">/react-native-staydirect</code> with native <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">StyleSheet</code>, <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">FlatList</code>, and direct WhatsApp/Phone native linking.
                </p>
              </div>
            </div>

            {/* Step 1: Run with Expo Go on your phone */}
            <div className="bg-[#F8FAF9] border border-[#E2E8F0] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-[#111C2D] text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#00362A] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  Run on your phone with Expo Go
                </strong>
                <span className="text-[10px] text-[#006C49] font-bold bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                  Free • 60s
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Download the free <strong>Expo Go</strong> app on your Android phone or iPhone from the app store. Then run:
              </p>

              {/* Terminal command snippet */}
              <div className="relative bg-[#111C2D] text-[#E2E8F0] rounded-xl p-3 font-mono text-[11px] overflow-x-auto">
                <pre className="whitespace-pre">{expoQuickCommand}</pre>
                <button
                  type="button"
                  onClick={handleCopyExpo}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#64748B]">
                Scan the terminal QR code with Expo Go to see StayDirect run at 60fps native speed on your actual device!
              </p>
            </div>

            {/* React Native Code Access */}
            <div className="bg-[#F0F3FF] border border-[#DEE8FF] rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#111C2D] block">React Native App.tsx</span>
                <span className="text-[10px] text-[#64748B]">Complete file with all styles & screens</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRNCode}
                className="px-3 py-1.5 rounded-xl bg-[#00362A] text-white text-xs font-bold hover:bg-[#124E3F] transition-all flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
                <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Toggle Full Code Preview */}
            <button
              type="button"
              onClick={() => setShowFullRNCode(!showFullRNCode)}
              className="text-[11px] font-bold text-[#006C49] hover:underline flex items-center gap-1 self-start"
            >
              <span className="material-symbols-outlined text-[14px]">
                {showFullRNCode ? 'expand_less' : 'expand_more'}
              </span>
              <span>{showFullRNCode ? 'Hide Code Preview' : 'Preview React Native Code Preview'}</span>
            </button>

            {showFullRNCode && (
              <div className="bg-[#1E293B] text-[#94A3B8] p-3 rounded-2xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed border border-[#334155]">
                <pre>{reactNativeAppSnippet}</pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: Instant PWA Mobile Installation */}
        {activeTab === 'pwa' && (
          <div className="flex flex-col gap-3.5 mt-4">
            <div className="bg-[#E8F5EE] border border-[#B4EFDA] rounded-2xl p-3.5 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#006C49] text-[24px] shrink-0 mt-0.5">
                download_done
              </span>
              <div className="text-xs">
                <span className="font-bold text-[#00362A] block">Zero App Store Wait</span>
                <p className="text-[#404945] text-[11px] mt-0.5 leading-relaxed">
                  Install StayDirect directly from your mobile browser with standalone display, app launcher icon, fast offline caching, and zero megabytes clutter.
                </p>
              </div>
            </div>

            {/* Android / Desktop Install Action */}
            {isInstalled ? (
              <div className="p-3 bg-[#E8F5EE] rounded-xl text-center text-xs font-bold text-[#006C49]">
                ✓ StayDirect is already installed on your device!
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full h-11 bg-[#00362A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#124E3F] transition-all active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                <span>Install Mobile App Now</span>
              </button>
            ) : (
              <div className="bg-[#F8FAF9] border border-[#E2E8F0] rounded-2xl p-3 text-xs space-y-2">
                <span className="font-bold text-[#111C2D] block">How to Install on Phone:</span>
                
                {/* Android Chrome */}
                <div className="flex items-start gap-2 text-[11px] text-[#404945]">
                  <span className="w-5 h-5 rounded-full bg-[#E8F5EE] text-[#006C49] font-bold flex items-center justify-center shrink-0">
                    A
                  </span>
                  <div>
                    <strong className="text-[#111C2D]">Android (Chrome / Edge):</strong>
                    <p className="mt-0.5">Tap the three dots (⋮) in the top-right corner → tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                </div>

                {/* iPhone / iPad */}
                <div className="flex items-start gap-2 text-[11px] text-[#404945] pt-1 border-t border-[#E2E8F0]/60">
                  <span className="w-5 h-5 rounded-full bg-[#DEE8FF] text-[#00362A] font-bold flex items-center justify-center shrink-0">
                    iOS
                  </span>
                  <div>
                    <strong className="text-[#111C2D]">iPhone / iPad (Safari):</strong>
                    <p className="mt-0.5">Tap the <strong>Share button (square with arrow)</strong> at the bottom of Safari → scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile App Highlights */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-center">
                <span className="material-symbols-outlined text-[#006C49] text-[18px] mb-1">
                  offline_bolt
                </span>
                <span className="text-[10px] font-bold text-[#111C2D] block">Offline Ready</span>
                <span className="text-[9px] text-[#64748B]">Caches properties</span>
              </div>
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-center">
                <span className="material-symbols-outlined text-[#006C49] text-[18px] mb-1">
                  fullscreen
                </span>
                <span className="text-[10px] font-bold text-[#111C2D] block">Standalone</span>
                <span className="text-[9px] text-[#64748B]">No browser bars</span>
              </div>
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-center">
                <span className="material-symbols-outlined text-[#006C49] text-[18px] mb-1">
                  touch_app
                </span>
                <span className="text-[10px] font-bold text-[#111C2D] block">Native Gestures</span>
                <span className="text-[9px] text-[#64748B]">Fast 60fps feel</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Native APK / Capacitor Build Guide */}
        {activeTab === 'native' && (
          <div className="flex flex-col gap-3 mt-4 text-xs">
            <p className="text-[11px] text-[#404945] leading-relaxed">
              Because this app is built with modern React 19 + Vite, you can bundle it into a <strong>standalone native Android .apk or Google Play / iOS app</strong> in 2 minutes using Capacitor:
            </p>

            {/* Command snippet box */}
            <div className="relative bg-[#111C2D] text-[#E2E8F0] rounded-2xl p-3 font-mono text-[11px] overflow-x-auto">
              <pre className="whitespace-pre">{capacitorCommand}</pre>
              <button
                type="button"
                onClick={handleCopyCommands}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-[#F0F3FF] rounded-2xl border border-[#D8E3FB] text-[11px] text-[#404945] space-y-1">
              <strong className="text-[#00362A] block">What Happens:</strong>
              <p>1. It wraps the compiled React app in a lightweight native Android WebView shell.</p>
              <p>2. Opens directly in Android Studio ready to click <strong>"Build APK"</strong> or connect your phone via USB to test!</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#F0F3FF] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#00362A] text-white text-xs font-bold rounded-xl hover:bg-[#124E3F] transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
