import React, { useState } from 'react';
import { Hostel } from '../types';

interface InteractiveMapViewProps {
  hostels: Hostel[];
  initialArea?: string;
  onSelectHostel: (hostel: Hostel) => void;
  onBack: () => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  hostels,
  initialArea = 'Hinjewadi',
  onSelectHostel,
  onBack,
}) => {
  const [selectedHostel, setSelectedHostel] = useState<Hostel>(hostels[0]);
  const [activeAreaFilter, setActiveAreaFilter] = useState(initialArea);

  const areas = ['All Pune', 'Hinjewadi', 'Wakad', 'Baner', 'Kothrud', 'Viman Nagar'];

  const filteredHostels =
    activeAreaFilter === 'All Pune'
      ? hostels
      : hostels.filter(
          (h) =>
            h.area.toLowerCase().includes(activeAreaFilter.toLowerCase()) ||
            h.fullAddress.toLowerCase().includes(activeAreaFilter.toLowerCase())
        );

  return (
    <div className="flex flex-col w-full h-[88vh] max-w-lg mx-auto bg-[#F9F9FF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm relative">
      {/* Top Map Header */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white text-[#111C2D] flex items-center justify-center shadow-md border border-[#E2E8F0]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="flex-1 bg-white rounded-xl px-3 py-2 shadow-md border border-[#E2E8F0] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006C49] text-[18px]">
              location_on
            </span>
            <span className="text-xs font-bold text-[#111C2D] truncate">
              {activeAreaFilter} • {filteredHostels.length} Direct Hostels
            </span>
          </div>
        </div>

        {/* Area Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActiveAreaFilter(a)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-xs shrink-0 transition-colors ${
                activeAreaFilter === a
                  ? 'bg-[#00362A] text-white'
                  : 'bg-white text-[#404945] border border-[#E2E8F0] hover:bg-[#F0F3FF]'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Styled Interactive Map Canvas Representation */}
      <div
        className="w-full h-full bg-[#E5E9EC] relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZxGPCT7ha39OLW99i0hzvvL7mB7xeFEZWrwcbH_o8BoDpwzuHUbc8iMYfxW3BO87QQ_0DzMLytnpTMaFJs13ckUXV6gZOLPUEvtGpGl7rhAvvZyfVBM0I2MOHlsS4y6D6Pgzur7PIk0INX4SHfLixGljpUTGGEAVLZwKlTokQL3wyLpGgIQW_GOMxh0MT5jQ3U9OK_E70Gxor4HSDWspVnrxuAskYj9NCubA4yP3RoGYZmmw17Uht')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#00362A]/10 pointer-events-none" />

        {/* Map Pins */}
        {hostels.map((h, i) => {
          const isSelected = selectedHostel?.id === h.id;
          // Position markers across relative coordinates on the simulated Pune map
          const positions = [
            { top: '35%', left: '40%' },
            { top: '48%', left: '30%' },
            { top: '28%', left: '60%' },
            { top: '65%', left: '50%' },
          ];
          const pos = positions[i % positions.length];

          return (
            <div
              key={h.id}
              onClick={() => setSelectedHostel(h)}
              style={{ top: pos.top, left: pos.left }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-lg font-bold text-xs ${
                  isSelected
                    ? 'bg-[#00362A] text-white ring-4 ring-[#6CF8BB]'
                    : 'bg-white text-[#00362A] border border-[#E2E8F0]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">home</span>
                <span>₹{h.monthlyRent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Selected Hostel Card */}
      {selectedHostel && (
        <div className="absolute bottom-4 inset-x-4 z-20 bg-white rounded-2xl p-3 shadow-xl border border-[#E2E8F0] animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#DEE8FF] shrink-0">
              <img
                src={selectedHostel.imageUrl}
                alt={selectedHostel.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-bold text-[#111C2D] truncate">
                    {selectedHostel.name}
                  </h3>
                  <span className="text-xs font-extrabold text-[#00362A]">
                    ₹{selectedHostel.monthlyRent.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <p className="text-[11px] text-[#404945] truncate mt-0.5">
                  {selectedHostel.fullAddress}
                </p>
                <p className="text-[10px] text-[#006C49] font-semibold mt-0.5">
                  {selectedHostel.distanceTag}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#F0F3FF]">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2A1700]">
                  <span
                    className="material-symbols-outlined text-[13px] text-[#F8A00F]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>{selectedHostel.rating}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectHostel(selectedHostel)}
                  className="px-3 py-1 bg-[#00362A] text-white text-xs font-bold rounded-lg hover:bg-[#124E3F] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
