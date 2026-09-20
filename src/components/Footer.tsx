import React from 'react';

interface FooterProps {
  onNavigate?: (screen: string) => void;
  onSelectArea?: (area: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectArea }) => {
  const puneColleges = [
    'MIT World Peace University (MIT-WPU)',
    'College of Engineering Pune (COEP)',
    'Symbiosis International (Symbiosis)',
    'Pune Institute of Computer Tech (PICT)',
    'Bharati Vidyapeeth Deemed University',
    'MKSSS Cummins College of Engg',
    'Vishwakarma Institute of Tech (VIT)',
    'Fergusson College (FC Road)',
  ];

  const puneLocalities = [
    'Kothrud',
    'Hinjewadi Phase 1 & 2',
    'Viman Nagar',
    'Shivajinagar',
    'Wakad',
    'Baner',
    'Karve Nagar',
    'Katraj',
    'Hadapsar',
    'Aundh',
    'Bavdhan',
    'Pashan',
  ];

  return (
    <footer className="w-full bg-[#00241B] text-[#B4EFDA]/90 border-t border-[#00362A] mt-16 pb-20 md:pb-0">
      {/* App Download / Zero Brokerage Banner Strip */}
      <div className="bg-[#00362A] border-b border-[#124E3F]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#006C49] text-white tracking-wider uppercase">
                100% Zero Brokerage
              </span>
              <span className="text-xs text-[#B4EFDA]">Direct Student-to-Owner Marketplace</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              For Better Deals & Instant Owner Chat, Explore on StayDirect
            </h3>
            <p className="text-sm text-[#B4EFDA]/80 mt-1">
              Verified room tours, transparent deposits, and no hidden broker charges across Pune.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate?.('search')}
              className="px-6 py-3 rounded-xl bg-[#006C49] hover:bg-[#00362A] text-white font-bold text-sm transition-all shadow-lg shadow-black/30 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find Hostels Now</span>
            </button>
            <button
              onClick={() => onNavigate?.('about')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10"
            >
              Why Zero Brokerage?
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00362A] to-[#006C49] flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[24px]">home_pin</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">
                  Stay<span className="text-[#006C49]">Direct</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase -mt-1">
                  Pune Student Housing Network
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed pr-6">
              StayDirect is Pune&apos;s leading student hostel & PG discovery network. We directly connect college students with verified property owners with absolutely zero broker fees, transparent deposits, and verified room amenities.
            </p>

            <div className="pt-2">
              <div className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">
                Our Guarantee
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-[#00241B] border border-[#124E3F] text-[#B4EFDA]">
                  ✓ Verified Owners
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#00241B] border border-[#124E3F] text-[#B4EFDA]">
                  ✓ ₹0 Brokerage
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#00241B] border border-[#124E3F] text-[#B4EFDA]">
                  ✓ Real Photos & Rates
                </span>
              </div>
            </div>

            <div className="text-xs text-[#8E95A2] pt-4">
              © {new Date().getFullYear()} StayDirect Technologies Ltd. All rights reserved.
            </div>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-white uppercase tracking-wider">
              Company
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('about')}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('about')}
                  className="hover:text-white transition-colors"
                >
                  Zero Brokerage Manifesto
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('help')}
                  className="hover:text-white transition-colors"
                >
                  Trust & Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('about')}
                  className="hover:text-white transition-colors"
                >
                  Student Community
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('help')}
                  className="hover:text-white transition-colors"
                >
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-white uppercase tracking-wider">
              Contact & Owners
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('help')}
                  className="hover:text-white transition-colors"
                >
                  Help & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('owner-home')}
                  className="text-[#006C49] hover:underline font-semibold"
                >
                  List Your PG / Hostel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('owner-home')}
                  className="hover:text-white transition-colors"
                >
                  Owner Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('help')}
                  className="hover:text-white transition-colors"
                >
                  Report an Issue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('help')}
                  className="hover:text-white transition-colors"
                >
                  FAQ for Students
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Pune Student Localities */}
          <div className="space-y-3">
            <div className="text-sm font-bold text-white uppercase tracking-wider">
              Hostels in Pune
            </div>
            <ul className="space-y-1.5 text-sm">
              {puneLocalities.slice(0, 8).map((locality) => (
                <li key={locality}>
                  <button
                    onClick={() => onSelectArea?.(locality)}
                    className="hover:text-white transition-colors text-left"
                  >
                    Hostels in {locality}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Popular Colleges Footnote */}
        <div className="mt-12 pt-8 border-t border-[#00362A]">
          <div className="text-xs font-bold text-[#B4EFDA] uppercase tracking-wider mb-3">
            Top Pune Colleges & Universities We Serve
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
            {puneColleges.map((col, idx) => (
              <span key={col} className="inline-flex items-center gap-2">
                <span className="hover:text-gray-300 transition-colors cursor-pointer">
                  {col}
                </span>
                {idx < puneColleges.length - 1 && <span className="text-gray-700">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
