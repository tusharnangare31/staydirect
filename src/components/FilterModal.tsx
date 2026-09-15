import React, { useState } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    maxPrice: number;
    category: string;
    gender: string;
    sharing: string;
    amenities: string[];
  }) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [maxPrice, setMaxPrice] = useState(12000);
  const [category, setCategory] = useState('All');
  const [gender, setGender] = useState('All');
  const [sharing, setSharing] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Free Wi-Fi',
    '3 Meals Included',
  ]);

  if (!isOpen) return null;

  const amenityOptions = [
    'Free Wi-Fi',
    '3 Meals Included',
    'AC Rooms',
    'Laundry Service',
    '24/7 Security Guard',
    'Power Backup',
    'RO Purifier Water',
    'Attached Bathroom',
  ];

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleReset = () => {
    setMaxPrice(15000);
    setCategory('All');
    setGender('All');
    setSharing('All');
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApply({
      maxPrice,
      category,
      gender,
      sharing,
      amenities: selectedAmenities,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F3FF]">
          <div>
            <h3 className="text-base font-bold text-[#111C2D]">Filter Hostels</h3>
            <p className="text-[11px] text-[#404945]">Pune Student & PG Accommodations</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#707975] hover:bg-[#F0F3FF]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 py-4">
          {/* Budget Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111C2D]">Max Monthly Rent</label>
              <span className="text-xs font-bold text-[#00362A]">
                Up to ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={4000}
              max={25000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#00362A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#707975]">
              <span>₹4,000</span>
              <span>₹15,000</span>
              <span>₹25,000+</span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]">Gender Restriction</label>
            <div className="grid grid-cols-4 gap-2">
              {['All', 'Boys', 'Girls', 'Co-ed'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    gender === g
                      ? 'bg-[#00362A] text-white border-[#00362A]'
                      : 'bg-white text-[#404945] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Accommodation Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]">Accommodation Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['All', 'PG', 'Hostel'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    category === cat
                      ? 'bg-[#00362A] text-white border-[#00362A]'
                      : 'bg-white text-[#404945] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Room Sharing */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]">Room Sharing</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['All', 'Single', 'Twin', 'Triple'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSharing(s)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    sharing === s
                      ? 'bg-[#00362A] text-white border-[#00362A]'
                      : 'bg-white text-[#404945] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]">Required Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {amenityOptions.map((item) => {
                const isSelected = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border text-left transition-colors ${
                      isSelected
                        ? 'bg-[#E8F5EE] border-[#006C49] text-[#006C49]'
                        : 'bg-white border-[#E2E8F0] text-[#404945]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F0F3FF]">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl bg-[#F0F3FF] text-[#404945] text-xs font-bold hover:bg-[#DEE8FF]"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-[2] py-2.5 rounded-xl bg-[#00362A] text-white text-xs font-bold shadow-md hover:bg-[#124E3F]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
