import React, { useState } from 'react';

interface LocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

const PUNE_ZONES = [
  { name: 'Kothrud', desc: 'Near MIT-WPU, Cummins College, Paud Road', count: '140+ Hostels' },
  { name: 'Hinjewadi', desc: 'Near Symbiosis Infotech, IT Park Phase 1 & 2', count: '120+ Hostels' },
  { name: 'Viman Nagar', desc: 'Near Symbiosis Law & Design, Phoenix Mall', count: '95+ Hostels' },
  { name: 'Shivajinagar', desc: 'Near COEP, Modern College, FC Road', count: '85+ Hostels' },
  { name: 'Wakad', desc: 'Near Indira College, JSPM, D-Mart', count: '110+ Hostels' },
  { name: 'Baner', desc: 'Near Balewadi High Street, NICMAR', count: '70+ Hostels' },
  { name: 'Karve Nagar', desc: 'Near Cummins College, Pratibha College', count: '65+ Hostels' },
  { name: 'Katraj', desc: 'Near Bharati Vidyapeeth, PICT Pune', count: '90+ Hostels' },
  { name: 'Hadapsar', desc: 'Near Magarpatta Cybercity, Amanora', count: '55+ Hostels' },
  { name: 'Aundh', desc: 'Near Pune University, Spicer College', count: '45+ Hostels' },
  { name: 'Bavdhan', desc: 'Near Flame University, Chandani Chowk', count: '40+ Hostels' },
];

export const LocationDrawer: React.FC<LocationDrawerProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  if (!isOpen) return null;

  const filteredZones = PUNE_ZONES.filter((zone) =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectGPS = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setIsDetectingLocation(false);
      onSelectLocation('Kothrud');
      onClose();
    }, 800);
  };

  const handleSelect = (zoneName: string) => {
    onSelectLocation(zoneName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close location picker"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <h2 className="text-xl font-bold text-[#111C2D] tracking-tight">
              Select Your Pune Location
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-4">
          <div className="relative flex items-center border border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-[#006C49] focus-within:shadow-[0_0_0_1px_#006C49] transition-all bg-white">
            <span className="material-symbols-outlined text-gray-400 mr-3 text-[22px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for area, street name, college..."
              className="w-full text-sm text-[#111C2D] placeholder-gray-400 focus:outline-none bg-transparent"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Location GPS Button */}
        <div className="px-6 pb-4">
          <button
            onClick={handleDetectGPS}
            disabled={isDetectingLocation}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-200 hover:border-[#006C49] hover:bg-emerald-50/50 transition-colors group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#006C49] shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">
                {isDetectingLocation ? 'refresh' : 'my_location'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-sm text-[#111C2D] group-hover:text-[#006C49] transition-colors">
                {isDetectingLocation ? 'Locating in Pune...' : 'Use Current Location'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Using GPS • Instant hostel recommendations nearby
              </div>
            </div>
          </button>
        </div>

        {/* City Zones List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Popular Pune Student Hubs
          </div>

          <button
            onClick={() => handleSelect('All Pune')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
              selectedLocation === 'All Pune'
                ? 'border-[#006C49] bg-emerald-50/40 shadow-xs'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006C49] flex items-center justify-center font-bold text-xs">
                ALL
              </div>
              <div>
                <div className="font-bold text-sm text-[#111C2D]">All Pune Locations</div>
                <div className="text-xs text-gray-500">Show all hostels across Pune</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#006C49] bg-white px-2.5 py-1 rounded-full border border-emerald-200">
              500+ Hostels
            </span>
          </button>

          {filteredZones.map((zone) => {
            const isSelected = selectedLocation.toLowerCase() === zone.name.toLowerCase();
            return (
              <button
                key={zone.name}
                onClick={() => handleSelect(zone.name)}
                className={`w-full flex items-start justify-between p-3.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-[#006C49] bg-emerald-50/40 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006C49] text-[20px] mt-0.5">
                    location_on
                  </span>
                  <div>
                    <div className="font-bold text-sm text-[#111C2D]">{zone.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{zone.desc}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 shrink-0 ml-2 mt-0.5">
                  {zone.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
