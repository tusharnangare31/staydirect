import React from 'react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col w-full pb-28 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#E7EEFF]"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">About StayDirect</h1>
          <p className="text-xs text-[#404945]">Pune’s Direct-to-Owner Student Platform</p>
        </div>
      </div>

      {/* Brand & Mission Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00362A] text-white flex items-center justify-center shadow-lg mb-3">
          <span className="material-symbols-outlined text-[36px]">home</span>
        </div>
        <h2 className="text-2xl font-black text-[#00362A] tracking-tight">StayDirect</h2>
        <span className="text-xs font-bold text-[#006C49] bg-[#E8F5EE] px-3 py-1 rounded-full mt-1 border border-[#B4EFDA]">
          Version 1.0.0 • Pune Edition
        </span>

        <p className="text-xs text-[#404945] leading-relaxed mt-4">
          StayDirect was created to revolutionize how students and working professionals find
          accommodation in Pune. By removing brokers and middlemen entirely, we ensure you get the
          real price, verified photos, and a direct line to genuine property owners.
        </p>
      </div>

      {/* Trust Pillars */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-[#111C2D] px-1">Why Students Choose StayDirect</span>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#006C49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">money_off</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111C2D]">100% Zero Brokerage</h3>
            <p className="text-[11px] text-[#404945] mt-0.5 leading-relaxed">
              No hidden broker fees or commission cuts. What you see is what you pay directly to the
              owner.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#006C49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111C2D]">Physical Verification</h3>
            <p className="text-[11px] text-[#404945] mt-0.5 leading-relaxed">
              Every property listed goes through physical photo verification and owner identity
              validation.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#006C49] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">forum</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111C2D]">Instant Direct Contact</h3>
            <p className="text-[11px] text-[#404945] mt-0.5 leading-relaxed">
              Call or chat in real time with owners, book physical visits, and finalize tenancies with
              clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Coverage Areas */}
      <div className="bg-[#F0F3FF] border border-[#D8E3FB] rounded-2xl p-4">
        <h3 className="text-xs font-bold text-[#00362A] mb-1">Key Pune Campuses Covered</h3>
        <p className="text-[11px] text-[#404945] leading-relaxed">
          Hinjewadi (Phases 1-3), Wakad, Kothrud (MIT Campus), Viman Nagar (Symbiosis), Baner,
          Balewadi High Street, Shivaji Nagar (COEP), and Kharadi IT SEZ.
        </p>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-[#94A3B8] space-y-1 pt-2">
        <p>© 2026 StayDirect Technologies Pvt. Ltd. All rights reserved.</p>
        <p>Crafted with pride for Pune’s student community.</p>
      </div>
    </div>
  );
};
