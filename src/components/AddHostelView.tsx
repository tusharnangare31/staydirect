import React, { useState } from 'react';
import { Hostel } from '../types';

interface AddHostelViewProps {
  onPublish: (newHostel: Partial<Hostel>) => void;
  onCancel: () => void;
}

export const AddHostelView: React.FC<AddHostelViewProps> = ({ onPublish, onCancel }) => {
  const [hostelName, setHostelName] = useState('Sunrise PG & Co-living');
  const [area, setArea] = useState('hinjewadi');
  const [monthlyRent, setMonthlyRent] = useState('8000');
  const [description, setDescription] = useState(
    'Spacious and well-furnished PG near Hinjewadi IT Park. Close to public transport, with homely North and South Indian food, high-speed Wi-Fi, and 24/7 biometric security.'
  );

  const [photos, setPhotos] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB5NB_XcpKitTvZnwZK1sW5Xu4nxDLKxIPHcqvCXOUb_zQAcClc9e1GjHJg0wjXpQSRwntMH7LCbv9KpCxbQHIOUbOKyxkjIJTP6VgdZVThbOTtDublfHoRj2cGidpc-D3eDk3s_52Q0UlyS-w96cJas347H0nEehFhKMtPlu2mjMZf9i3ZzEto0UE1qc97wmMn1yLRacJBFVRmXP0wkzcNxu3efSh5LHA8IZ_pMniVnJNuyjGZUdbo',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA7L7j8f6E49Ly7XjEmBlEri-_ZKfm-tcRvb1q0KiO2_f9yW-n18OGwNhraQVwpcuHaL0Sj27w7Q7ucm__x0uykNSbGTjUf6fJeR3kiEBvEYF9fqcDbBN8Bq2wZSpxa4JFSh_okbn5pA6-W4jd3XX9Q4ltFklLnfkUiuaW3U_mgUYep_4jQIxe3SlnIk_PUt5Aen1wgd6YPlR7M7f2nh-zUlISOC1dy3JkMOGNtuGl9NEa_7qwFsxEm',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhpoqt71QfUIi6FyY8LQaQV4N6HnaYKtCmoWrQT8Vriys0dnSeeMIBzbK-zM8jeRzEte0L_pkGmgk1blgaB7Z7nesYYV-lLNAjq4Yct8kCJ82JO4Uteus0QEBS-BhCpF4siFVY-4SrLygiqgM5glPUBq8QhS9kJNbpfANy73vqEkqqKS2JWwDcIRe0p4GmNp2KcRepm9u-RitMoMxjCqT7zc8uRGC5KgjeSQvuqUdr4zVrHJ2tMt1',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6xdPDO4_4r4s4PwOogRHLhSNtwCRYXcpH7GVH6A9t9J9UGDxh1xZRPn57yBYcpIJmTfvsLMnz9UOp95nCRc-WuOX2luCQ9jtKhz9onQxji0kcn_xA6x9HNJd2I3Gsuy7oxfZ49zIwXbpwi4lfGLyOCDNhzeA6PJSCW5--j3JSrygb4WxzkuH1I3gM7jddgeRb6ZnkQenxyGC0IJov5xs-f-q2Y_jS8zMm28INyPU2dt4tZ8tjrNP_',
  ]);

  const [activeAmenities, setActiveAmenities] = useState<Record<string, boolean>>({
    'Wi-Fi': true,
    Meals: true,
    Laundry: true,
    Security: true,
    AC: false,
    'Power Backup': false,
    Housekeeping: false,
    'RO Water': false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleAmenity = (name: string) => {
    setActiveAmenities((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    // Add realistic sample hostel photo
    const sample = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1KkFT9k3kOXuW6VgmXM000pzW2PqIyvkF_Bx3pT5_qCPMjBmTbLWcffGZS1ZiG6BA3RqQDU-myVh2IQpGxvVrSlGO6emRMYV8pJYcCMBtO3XVtaQiGARUMRKHAlFPMZdyGrb16xDW6RC2Ucmvz0htylnCJsf6-fVEFQX17CZ2MqzJ6G6Tic_9sLZ3Tc-dC9jTUcqjR9lngRe2suIH4k6cpeKcXBqfEGOJJBPfl2kUsFhgsJgOVrDw';
    if (photos.length < 10) {
      setPhotos((prev) => [...prev, sample]);
    }
  };

  const handlePublish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      const areaLabels: Record<string, string> = {
        hinjewadi: 'Hinjewadi',
        kothrud: 'Kothrud',
        viman_nagar: 'Viman Nagar',
        wakad: 'Wakad',
        baner: 'Baner',
        kharadi: 'Kharadi',
        shivaji_nagar: 'Shivaji Nagar',
      };

      const selectedAmenitiesList = Object.entries(activeAmenities)
        .filter(([_, active]) => active)
        .map(([name]) => name);

      onPublish({
        name: hostelName,
        area: areaLabels[area] || 'Hinjewadi',
        fullAddress: `${areaLabels[area] || 'Hinjewadi'}, Pune`,
        monthlyRent: Number(monthlyRent) || 8000,
        description,
        amenities: selectedAmenitiesList,
        imageUrl: photos[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1KkFT9k3kOXuW6VgmXM000pzW2PqIyvkF_Bx3pT5_qCPMjBmTbLWcffGZS1ZiG6BA3RqQDU-myVh2IQpGxvVrSlGO6emRMYV8pJYcCMBtO3XVtaQiGARUMRKHAlFPMZdyGrb16xDW6RC2Ucmvz0htylnCJsf6-fVEFQX17CZ2MqzJ6G6Tic_9sLZ3Tc-dC9jTUcqjR9lngRe2suIH4k6cpeKcXBqfEGOJJBPfl2kUsFhgsJgOVrDw',
        galleryImages: photos,
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Breadcrumb & Step Indicator */}
      <div className="flex items-center justify-between py-2 mb-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006C49]">
            Owner Portal
          </span>
          <h2 className="text-xl font-bold text-[#111C2D]">Add New Hostel</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0F3FF] rounded-full text-[#404945] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Step 2 of 3</span>
        </div>
      </div>

      {/* Multi-step Flow Bar */}
      <div className="flex items-center justify-between w-full mb-5 gap-2">
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-[#124E3F] text-white flex items-center justify-center text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">check</span>
          </div>
          <span className="text-[11px] text-[#00362A] font-semibold">Basic Info</span>
        </div>

        <div className="h-0.5 flex-1 bg-[#124E3F]" />

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-[#00362A] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            2
          </div>
          <span className="text-[11px] text-[#00362A] font-bold">Details & Media</span>
        </div>

        <div className="h-0.5 flex-1 bg-[#E2E8F0]" />

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-[#DEE8FF] text-[#404945] flex items-center justify-center text-xs font-semibold">
            3
          </div>
          <span className="text-[11px] text-[#707975]">Review</span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="flex flex-col gap-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
        {/* Add Photos Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111C2D] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006C49] text-[18px]">
                photo_library
              </span>
              Hostel Photos
            </label>
            <span className="text-[10px] font-semibold text-[#404945] bg-[#F0F3FF] px-2 py-0.5 rounded-full">
              {photos.length} / 10 uploaded
            </span>
          </div>

          {/* Upload Zone */}
          <div
            onClick={handleAddPhoto}
            className="flex flex-col items-center justify-center p-5 bg-[#F0F3FF] border-2 border-dashed border-[#D8E3FB] rounded-xl cursor-pointer hover:bg-[#DEE8FF]/40 transition-colors text-center group"
          >
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#00362A] group-hover:scale-105 transition-transform shadow-xs mb-1.5">
              <span className="material-symbols-outlined text-[24px]">photo_camera</span>
            </div>
            <span className="text-xs font-bold text-[#111C2D]">Upload clear images</span>
            <span className="text-[10px] text-[#404945] mt-0.5">
              Show bedrooms, bathrooms, mess, and facade (up to 10)
            </span>
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-xs bg-[#DEE8FF] border border-[#E2E8F0]"
              >
                <img src={url} alt={`Hostel ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  aria-label="Remove photo"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[12px] hover:bg-[#BA1A1A] transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
            ))}

            {photos.length < 10 && (
              <button
                type="button"
                onClick={handleAddPhoto}
                aria-label="Add more photos"
                className="w-20 h-20 rounded-xl bg-[#F0F3FF] border border-dashed border-[#D8E3FB] flex flex-col items-center justify-center text-[#00362A] hover:bg-[#DEE8FF] transition-colors shrink-0 active:scale-95"
              >
                <span className="material-symbols-outlined text-[22px]">add</span>
                <span className="text-[10px] font-bold mt-0.5">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Inputs Form */}
        <div className="flex flex-col gap-4">
          {/* Hostel Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="hostel-name">
              Hostel / PG Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px] pointer-events-none">
                apartment
              </span>
              <input
                id="hostel-name"
                type="text"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="e.g. Sunrise PG & Coliving"
                className="w-full h-11 pl-9 pr-3 bg-[#F0F3FF] rounded-xl text-[#111C2D] text-xs border border-[#E2E8F0] focus:outline-none focus:bg-white focus:border-[#006C49]"
              />
            </div>
          </div>

          {/* Select Area Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="hostel-area">
              Select Area in Pune
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px] pointer-events-none">
                location_on
              </span>
              <select
                id="hostel-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-11 pl-9 pr-9 bg-[#F0F3FF] rounded-xl text-[#111C2D] text-xs border border-[#E2E8F0] appearance-none focus:outline-none focus:bg-white focus:border-[#006C49] cursor-pointer"
              >
                <option value="hinjewadi">Hinjewadi (Phase 1, 2 & 3)</option>
                <option value="kothrud">Kothrud / MIT Campus</option>
                <option value="viman_nagar">Viman Nagar / Symbiosis</option>
                <option value="wakad">Wakad</option>
                <option value="baner">Baner / Balewadi</option>
                <option value="kharadi">Kharadi / EON Free Zone</option>
                <option value="shivaji_nagar">Shivaji Nagar / COEP</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 text-[#707975] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111C2D]" htmlFor="hostel-rent">
                Monthly Rent (₹)
              </label>
              <span className="text-[11px] font-bold text-[#006C49]">Zero Brokerage</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#00362A] font-bold text-sm pointer-events-none">
                ₹
              </span>
              <input
                id="hostel-rent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="8000"
                className="w-full h-11 pl-8 pr-16 bg-[#F0F3FF] rounded-xl text-[#111C2D] font-bold text-sm border border-[#E2E8F0] focus:outline-none focus:bg-white focus:border-[#006C49]"
              />
              <span className="absolute right-3 text-xs text-[#707975]">/ month</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="hostel-desc">
              Description
            </label>
            <textarea
              id="hostel-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe room furnishings, food timings, restrictions, nearby transit points..."
              className="w-full p-3 bg-[#F0F3FF] rounded-xl text-[#111C2D] text-xs border border-[#E2E8F0] focus:outline-none focus:bg-white focus:border-[#006C49] resize-none"
            />
          </div>

          {/* Amenities Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111C2D]">Amenities Included</label>
              <span className="text-[11px] text-[#707975]">Tap to toggle</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(activeAmenities).map(([name, isActive]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#00362A] text-white shadow-sm'
                      : 'bg-[#F0F3FF] text-[#404945] border border-[#E2E8F0] hover:bg-[#DEE8FF]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {name === 'Wi-Fi'
                      ? 'wifi'
                      : name === 'Meals'
                      ? 'restaurant'
                      : name === 'Laundry'
                      ? 'local_laundry_service'
                      : name === 'Security'
                      ? 'shield'
                      : name === 'AC'
                      ? 'ac_unit'
                      : name === 'Power Backup'
                      ? 'bolt'
                      : name === 'Housekeeping'
                      ? 'cleaning_services'
                      : 'water_drop'}
                  </span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Badge Guarantee Box */}
        <div className="flex items-center gap-3 p-3 bg-[#B4EFDA]/30 border border-[#B4EFDA] rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#006C49] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#00362A]">
              StayDirect Direct Assurance
            </span>
            <span className="text-[11px] text-[#404945]">
              Listing directly reaches 15,000+ verified Pune students without broker cuts.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            disabled={isSubmitting || submitSuccess}
            onClick={handlePublish}
            className={`w-full h-12 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              submitSuccess
                ? 'bg-[#006C49]'
                : isSubmitting
                ? 'bg-[#124E3F] opacity-90'
                : 'bg-[#00362A] hover:bg-[#124E3F] active:scale-[0.99]'
            }`}
          >
            {submitSuccess ? (
              <>
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                <span>Listing Live Successfully!</span>
              </>
            ) : isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                <span>Publishing to Pune Listings...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Publish Listing</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full h-11 bg-[#F0F3FF] border border-[#E2E8F0] text-[#404945] rounded-xl font-semibold text-xs flex items-center justify-center hover:bg-[#DEE8FF] transition-colors"
          >
            Save Draft & Preview
          </button>
        </div>
      </div>
    </div>
  );
};
