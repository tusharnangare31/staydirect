import React, { useState } from 'react';
import { Hostel } from '../types';

interface HostelDetailsModalProps {
  hostel: Hostel | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDirectChat: (hostel: Hostel) => void;
  onOpenMap: (area: string) => void;
}

export const HostelDetailsModal: React.FC<HostelDetailsModalProps> = ({
  hostel,
  onClose,
  isSaved,
  onToggleSave,
  onOpenDirectChat,
  onOpenMap,
}) => {
  const [selectedOccupancyIndex, setSelectedOccupancyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showBookVisitModal, setShowBookVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('Tomorrow, 4:00 PM');
  const [visitConfirmed, setVisitConfirmed] = useState(false);

  if (!hostel) return null;

  const gallery = hostel.galleryImages && hostel.galleryImages.length > 0
    ? hostel.galleryImages
    : [hostel.imageUrl];

  const handleNextPhoto = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hostel.name,
          text: `Check out ${hostel.name} in ${hostel.area}, Pune on StayDirect - 0% Brokerage!`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(`Link to ${hostel.name} copied to clipboard!`);
    }
  };

  const handleConfirmVisit = () => {
    setVisitConfirmed(true);
    setTimeout(() => {
      setVisitConfirmed(false);
      setShowBookVisitModal(false);
      onOpenDirectChat(hostel);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex justify-center">
      <div className="relative w-full max-w-lg min-h-screen bg-[#F9F9FF] flex flex-col pb-28 shadow-2xl">
        {/* Hero Gallery Section */}
        <div className="relative w-full h-72 bg-[#DEE8FF] overflow-hidden">
          <img
            src={gallery[currentImageIndex]}
            alt={hostel.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleNextPhoto}
            title="Click to view next image"
          />

          {/* Top Floating Overlay Controls */}
          <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10">
            <button
              type="button"
              onClick={onClose}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full bg-white/90 text-[#00362A] flex items-center justify-center shadow-md transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share listing"
                className="w-10 h-10 rounded-full bg-white/90 text-[#00362A] flex items-center justify-center shadow-md transition-transform active:scale-95 hover:bg-white"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(hostel.id)}
                aria-label="Save to favorites"
                className={`w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                  isSaved ? 'text-[#BA1A1A]' : 'text-[#707975]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </div>
          </div>

          {/* Image Counter Pill */}
          <div
            onClick={handleNextPhoto}
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#263143]/80 backdrop-blur-md text-[#ECF1FF] text-[11px] font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">photo_library</span>
            <span>{currentImageIndex + 1}/{gallery.length}</span>
          </div>

          {/* Verified Badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#6CF8BB] text-[#00714D] text-[11px] font-bold shadow-sm flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span>Verified Direct</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-4 space-y-3.5 -mt-2">
          {/* Header Info Panel */}
          <div className="p-4 bg-white rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col gap-2 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-[#111C2D] tracking-tight">{hostel.name}</h2>
                <div className="flex items-center gap-1 mt-1 text-[#404945] text-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#006C49]">
                    location_on
                  </span>
                  <span className="truncate">{hostel.fullAddress}</span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-extrabold text-[#00362A]">
                    ₹{hostel.monthlyRent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#404945]">/mo</span>
                </div>
                <span className="text-[11px] text-[#006C49] font-bold">Zero Brokerage</span>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F0F3FF]">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FFDDB8] text-[#2A1700] rounded-full text-xs font-semibold">
                <span
                  className="material-symbols-outlined text-[14px] text-[#F8A00F]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span>{hostel.rating}</span>
                <span className="text-[#404945] font-normal">({hostel.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#F0F3FF] text-[#404945] rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                <span>{hostel.distanceTag}</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#F0F3FF] text-[#404945] rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">
                  {hostel.gender === 'Boys' ? 'male' : hostel.gender === 'Girls' ? 'female' : 'group'}
                </span>
                <span>{hostel.gender} PG</span>
              </div>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-[#111C2D]">Key Amenities</span>
              <span className="text-xs text-[#006C49] font-semibold">All 14 Included</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-0.5">
              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-xs border border-[#E2E8F0] text-center">
                <div className="w-9 h-9 rounded-full bg-[#B4EFDA] flex items-center justify-center text-[#00362A] mb-1">
                  <span className="material-symbols-outlined text-[18px]">single_bed</span>
                </div>
                <span className="text-[11px] font-medium text-[#111C2D] truncate w-full">Single Bed</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-xs border border-[#E2E8F0] text-center">
                <div className="w-9 h-9 rounded-full bg-[#6FFBBE] flex items-center justify-center text-[#006C49] mb-1">
                  <span className="material-symbols-outlined text-[18px]">wifi</span>
                </div>
                <span className="text-[11px] font-medium text-[#111C2D] truncate w-full">High-Speed</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-xs border border-[#E2E8F0] text-center">
                <div className="w-9 h-9 rounded-full bg-[#FFDDB8] flex items-center justify-center text-[#633D00] mb-1">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                </div>
                <span className="text-[11px] font-medium text-[#111C2D] truncate w-full">3x Meals</span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-xs border border-[#E2E8F0] text-center">
                <div className="w-9 h-9 rounded-full bg-[#99D2BE] flex items-center justify-center text-[#00362A] mb-1">
                  <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
                </div>
                <span className="text-[11px] font-medium text-[#111C2D] truncate w-full">Laundry</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="p-4 bg-white rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#111C2D]">About {hostel.name}</h3>
            <p className="text-xs text-[#404945] leading-relaxed">
              {hostel.description}
            </p>
            <div className="flex items-center gap-2 mt-1 p-2.5 bg-[#F0F3FF] rounded-xl text-xs text-[#00362A] font-medium">
              <span className="material-symbols-outlined text-[#006C49] text-[18px] shrink-0">
                shield_with_heart
              </span>
              <span>Owner managed property • Direct tenancy contract</span>
            </div>
          </div>

          {/* Available Room Occupancies */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-[#111C2D] px-1">Available Occupancy</span>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              {hostel.occupancies.map((occ, idx) => {
                const isSelected = selectedOccupancyIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedOccupancyIndex(idx)}
                    className={`p-3 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E8F5EE] border-[#006C49] ring-2 ring-[#006C49]/20'
                        : 'bg-white border-[#E2E8F0] hover:border-[#B4EFDA]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111C2D]">{occ.type}</span>
                        <span className="px-1.5 py-0.5 bg-[#6CF8BB]/40 text-[#00714D] rounded-full text-[10px] font-bold">
                          {occ.left} Left
                        </span>
                      </div>
                      <p className="text-[11px] text-[#404945] mt-1">{occ.details}</p>
                    </div>
                    <div className="mt-2.5 text-sm font-bold text-[#00362A]">
                      ₹{occ.price.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-[#404945] font-normal">/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Surroundings */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-[#111C2D]">Location & Surroundings</span>
              <button
                type="button"
                onClick={() => onOpenMap(hostel.area)}
                className="text-xs text-[#006C49] font-bold hover:underline"
              >
                View Full Map
              </button>
            </div>

            <div
              onClick={() => onOpenMap(hostel.area)}
              className="w-full h-36 bg-cover bg-center rounded-2xl relative shadow-xs overflow-hidden border border-[#E2E8F0] cursor-pointer group"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZxGPCT7ha39OLW99i0hzvvL7mB7xeFEZWrwcbH_o8BoDpwzuHUbc8iMYfxW3BO87QQ_0DzMLytnpTMaFJs13ckUXV6gZOLPUEvtGpGl7rhAvvZyfVBM0I2MOHlsS4y6D6Pgzur7PIk0INX4SHfLixGljpUTGGEAVLZwKlTokQL3wyLpGgIQW_GOMxh0MT5jQ3U9OK_E70Gxor4HSDWspVnrxuAskYj9NCubA4yP3RoGYZmmw17Uht')`,
              }}
            >
              <div className="absolute inset-0 bg-[#00362A]/10 group-hover:bg-[#00362A]/20 transition-colors" />
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#006C49]">
                  near_me
                </span>
                <span className="text-[11px] text-[#111C2D] font-bold">
                  {hostel.distanceTag} • 5 mins walk to transit
                </span>
              </div>
            </div>
          </div>

          {/* Hostel Policies */}
          <div className="p-4 bg-white rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#111C2D]">Hostel Policy</h3>
            <div className="flex flex-col gap-2 mt-0.5 text-xs text-[#404945]">
              {hostel.policies.map((policy, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#006C49]">
                    {idx === 0 ? 'schedule' : idx === 1 ? 'smoke_free' : 'payments'}
                  </span>
                  <span>{policy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Profile Snapshot */}
          <div className="p-3.5 bg-[#B4EFDA]/40 border border-[#B4EFDA] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#DEE8FF] shadow-xs shrink-0 ring-2 ring-white">
                <img
                  src={hostel.owner.avatarUrl}
                  alt={hostel.owner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#002018]">
                  {hostel.owner.name} (Owner)
                </span>
                <span className="text-xs text-[#145041]">
                  {hostel.owner.responseTime} • {hostel.owner.tagline}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#006C49] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-3.5 border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {/* Call Button */}
            <button
              type="button"
              onClick={() => setShowCallAlert(true)}
              className="flex-1 h-12 rounded-xl bg-white text-[#00362A] font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform border-2 border-[#00362A]"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>Call</span>
            </button>

            {/* Book Visit / Chat Button */}
            <button
              type="button"
              onClick={() => setShowBookVisitModal(true)}
              className="flex-[1.4] h-12 rounded-xl bg-[#00362A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#124E3F] active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>Book Visit</span>
            </button>
          </div>
        </div>

        {/* Call Dialog Modal */}
        {showCallAlert && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl border border-[#E2E8F0] text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-[#E8F5EE] text-[#006C49] mx-auto flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[26px]">call</span>
              </div>
              <h4 className="text-base font-bold text-[#111C2D]">Direct Owner Connect</h4>
              <p className="text-xs text-[#404945] mt-1">
                Zero brokerage guarantee. Connecting directly to {hostel.owner.name}:
              </p>
              <p className="text-sm font-mono font-bold text-[#00362A] mt-2 bg-[#F0F3FF] py-2 rounded-lg">
                {hostel.owner.phone}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCallAlert(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F0F3FF] text-[#404945] text-xs font-semibold"
                >
                  Close
                </button>
                <a
                  href={`tel:${hostel.owner.phone}`}
                  onClick={() => setShowCallAlert(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00362A] text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Book Visit Dialog Modal */}
        {showBookVisitModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-[#E2E8F0] text-left animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-bold text-[#111C2D]">Schedule a Visit</h4>
                <button
                  onClick={() => setShowBookVisitModal(false)}
                  className="text-[#707975] hover:text-[#111C2D]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <p className="text-xs text-[#404945] mb-3">
                Book a free physical walkthrough of {hostel.name} with the owner.
              </p>

              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-[#111C2D] block">
                  Select Preferred Slot:
                </label>
                {['Today, 5:30 PM', 'Tomorrow, 11:00 AM', 'Tomorrow, 4:00 PM', 'This Sunday, 12:00 PM'].map(
                  (slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setVisitDate(slot)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        visitDate === slot
                          ? 'bg-[#E8F5EE] border-[#006C49] text-[#006C49]'
                          : 'bg-white border-[#E2E8F0] text-[#404945]'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                )}
              </div>

              {visitConfirmed ? (
                <div className="bg-[#E8F5EE] text-[#006C49] p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  Visit slot requested! Opening chat...
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookVisitModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#F0F3FF] text-[#404945] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmVisit}
                    className="flex-1 py-2.5 rounded-xl bg-[#00362A] text-white text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    Confirm Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
