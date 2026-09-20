import React, { useState } from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onLogin }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      badge: 'Zero Brokerage • 100% Direct Connect',
      title: 'Find Your Home. No Brokerage.',
      subtitle:
        'Connecting university students and young professionals directly with verified hostel & PG owners across Pune.',
      illustrationType: 'city',
      cards: [
        {
          icon: 'verified',
          title: 'Verified Hostels',
          desc: 'Inspected rooms with real pictures and genuine monthly rent prices.',
        },
        {
          icon: 'contact_phone',
          title: 'Direct Contact',
          desc: 'Chat or call hostel owners directly. Zero middlemen, zero commission.',
        },
        {
          icon: 'school',
          title: 'Student Centric',
          desc: 'Curated stays near Symbiosis, MIT, COEP, PICT, and Hinjewadi IT parks.',
        },
      ],
    },
    {
      badge: 'Verified PGs in Hinjewadi, Kothrud & Viman Nagar',
      title: 'Stay Close to What Matters.',
      subtitle:
        'Walk to your college lectures or tech park offices. Enjoy clean meals, high-speed Wi-Fi, and safe community living.',
      illustrationType: 'community',
      cards: [
        {
          icon: 'wifi',
          title: 'Study-Ready Wi-Fi',
          desc: 'High-speed fiber connectivity for research, remote exams, and study marathons.',
        },
        {
          icon: 'restaurant',
          title: 'Homestyle Meals',
          desc: 'Nutritious breakfast, lunch, and dinner cooked fresh daily.',
        },
        {
          icon: 'shield',
          title: 'Safe Campus Environment',
          desc: 'Biometric access, 24x7 security staff, and CCTV monitored premises.',
        },
      ],
    },
  ];

  const current = slides[slide];

  return (
    <div className="flex flex-col items-center justify-between min-h-[90vh] py-6 px-4 max-w-lg mx-auto">
      {/* Top Banner Tag */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] border border-[#6CF8BB] text-[#006C49] text-xs font-bold shadow-xs">
        <span className="material-symbols-outlined text-[16px]">verified</span>
        <span>{current.badge}</span>
      </div>

      {/* Center Illustration & Copy */}
      <div className="flex flex-col items-center text-center my-4 w-full">
        {/* Artistic SVG Graphic representing Pune student living */}
        <div className="w-full max-w-xs h-48 my-3 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#B4EFDA]/40 to-[#DEE8FF]/50 rounded-3xl -rotate-2" />
          <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-xs border border-[#E2E8F0] rounded-3xl p-4 flex flex-col items-center justify-center shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-[#00362A]/20 bg-[#00362A] shrink-0">
                <img src="/icon.svg" alt="StayDirect Custom Logo" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#6CF8BB] text-[#00362A] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px]">school</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#FFDDB8] text-[#633D00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#006C49] font-bold text-xs bg-[#E8F5EE] px-3 py-1 rounded-full mt-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Direct Connect Pune</span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium mt-2">
              Hinjewadi • Kothrud • Viman Nagar • Wakad
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-[#111C2D] tracking-tight mt-2">
          {current.title}
        </h1>
        <p className="text-xs text-[#404945] max-w-xs mt-1.5 leading-relaxed">
          {current.subtitle}
        </p>

        {/* Value Prop Cards */}
        <div className="grid grid-cols-3 gap-2 w-full mt-5">
          {current.cards.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-2.5 flex flex-col items-center text-center shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#F0F3FF] text-[#00362A] flex items-center justify-center mb-1.5">
                <span className="material-symbols-outlined text-[17px]">{c.icon}</span>
              </div>
              <h3 className="text-[11px] font-bold text-[#111C2D]">{c.title}</h3>
              <p className="text-[9px] text-[#64748B] mt-0.5 leading-tight line-clamp-3">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setSlide(0)}
            className={`h-2 rounded-full transition-all ${
              slide === 0 ? 'w-6 bg-[#00362A]' : 'w-2 bg-[#CBD5E1]'
            }`}
            aria-label="Slide 1"
          />
          <button
            onClick={() => setSlide(1)}
            className={`h-2 rounded-full transition-all ${
              slide === 1 ? 'w-6 bg-[#00362A]' : 'w-2 bg-[#CBD5E1]'
            }`}
            aria-label="Slide 2"
          />
        </div>
      </div>

      {/* Bottom CTA Actions */}
      <div className="w-full flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={onGetStarted}
          className="w-full h-12 bg-[#00362A] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#124E3F] transition-all active:scale-[0.99]"
        >
          <span>Find Hostels in Pune</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        <button
          type="button"
          onClick={onLogin}
          className="w-full h-11 bg-white border border-[#E2E8F0] text-[#111C2D] rounded-2xl font-semibold text-xs flex items-center justify-center hover:bg-[#F0F3FF] transition-colors"
        >
          Already a Member? Log In
        </button>

        <p className="text-[10px] text-center text-[#94A3B8] mt-1">
          Pune, Maharashtra • 100% Zero Brokerage Policy
        </p>
      </div>
    </div>
  );
};
