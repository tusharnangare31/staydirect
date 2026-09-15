import React, { useState } from 'react';
import { Hostel } from '../types';

interface OwnerListingsViewProps {
  hostels: Hostel[];
  onAddNewHostel: () => void;
  onEditHostel: (hostel: Hostel) => void;
  onViewLive: (hostel: Hostel) => void;
  onToggleActive: (id: string) => void;
}

export const OwnerListingsView: React.FC<OwnerListingsViewProps> = ({
  hostels,
  onAddNewHostel,
  onEditHostel,
  onViewLive,
  onToggleActive,
}) => {
  const [tab, setTab] = useState<'active' | 'inactive'>('active');

  const activeHostels = hostels.filter((h) => h.isActive !== false);
  const inactiveHostels = hostels.filter((h) => h.isActive === false);

  const currentList = tab === 'active' ? activeHostels : inactiveHostels;

  return (
    <div className="flex flex-col w-full pb-28 space-y-4">
      {/* Header & Notifications */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">My Listings</h1>
          <p className="text-xs text-[#404945]">Manage hostel properties in Pune</p>
        </div>

        <button
          type="button"
          onClick={onAddNewHostel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00362A] text-white text-xs font-bold shadow-xs hover:bg-[#124E3F] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Property</span>
        </button>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-[#F0F3FF] p-1 rounded-xl border border-[#D8E3FB]">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'active'
              ? 'bg-white text-[#00362A] shadow-xs'
              : 'text-[#404945] hover:text-[#111C2D]'
          }`}
        >
          Active ({activeHostels.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('inactive')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'inactive'
              ? 'bg-white text-[#00362A] shadow-xs'
              : 'text-[#404945] hover:text-[#111C2D]'
          }`}
        >
          Inactive ({inactiveHostels.length})
        </button>
      </div>

      {/* Listings List */}
      <div className="flex flex-col gap-3">
        {currentList.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#707975] mb-2">
              apartment
            </span>
            <p className="text-sm font-bold text-[#111C2D]">No {tab} listings</p>
            <p className="text-xs text-[#404945] mt-1">
              {tab === 'active'
                ? 'You do not have any active hostels published.'
                : 'All your listings are currently active.'}
            </p>
          </div>
        ) : (
          currentList.map((hostel) => {
            const isActive = hostel.isActive !== false;

            return (
              <div
                key={hostel.id}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-xs flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#DEE8FF] shrink-0">
                    <img
                      src={hostel.imageUrl}
                      alt={hostel.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1 rounded">
                      {hostel.gender}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h2 className="text-sm font-bold text-[#111C2D] truncate">
                          {hostel.name}
                        </h2>

                        {/* Status toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleActive(hostel.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            isActive
                              ? 'bg-[#E8F5EE] text-[#006C49] border border-[#B4EFDA]'
                              : 'bg-[#F0F3FF] text-[#707975] border border-[#E2E8F0]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Paused'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-[#404945] truncate mt-0.5">
                        {hostel.fullAddress}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-bold text-[#00362A]">
                        ₹{hostel.monthlyRent.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-[#707975] font-normal">/mo</span>
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-[#006C49] font-medium">
                        <span className="material-symbols-outlined text-[13px]">forum</span>
                        <span>{hostel.reviewCount} inquiries</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#F0F3FF]">
                  <button
                    type="button"
                    onClick={() => onViewLive(hostel)}
                    className="flex-1 h-9 rounded-xl bg-[#F0F3FF] text-[#00362A] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#DEE8FF] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Live
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditHostel(hostel)}
                    className="flex-1 h-9 rounded-xl bg-[#00362A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#124E3F] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit Listing
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add another hostel or PG prompt banner */}
      <div className="bg-[#F0F3FF] border border-[#D8E3FB] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00362A] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">add_home</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#00362A]">Add another hostel or PG?</h2>
            <p className="text-[11px] text-[#404945]">Expand your presence across Pune</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNewHostel}
          className="px-3.5 py-2 bg-[#00362A] text-white rounded-xl text-xs font-bold hover:bg-[#124E3F] transition-colors shadow-xs"
        >
          + Add New
        </button>
      </div>
    </div>
  );
};
