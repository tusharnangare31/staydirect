import React, { useState } from 'react';
import { Inquiry, Hostel } from '../types';

interface OwnerHomeViewProps {
  inquiries: Inquiry[];
  hostels: Hostel[];
  onAddNewHostel: () => void;
  onOpenChatWithStudent: (inquiry: Inquiry) => void;
  onViewAllInquiries: () => void;
  onViewAllListings: () => void;
}

export const OwnerHomeView: React.FC<OwnerHomeViewProps> = ({
  inquiries,
  hostels,
  onAddNewHostel,
  onOpenChatWithStudent,
  onViewAllInquiries,
  onViewAllListings,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'scheduled' | 'followups'>('all');
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const activeHostelsCount = hostels.filter((h) => h.isActive).length;

  const filteredInquiries = inquiries.filter((inq) => {
    if (selectedFilter === 'unread') return inq.unread;
    if (selectedFilter === 'scheduled') return inq.status === 'SCHEDULED';
    if (selectedFilter === 'followups') return inq.status === 'CONTACTED';
    return true;
  });

  const handleCall = (studentName: string) => {
    setCallNotice(`Direct connect initiated with ${studentName}. Dialing student number with 0% brokerage.`);
    setTimeout(() => setCallNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full space-y-4 pb-24">
      {/* Top Greeting & Role Switcher Banner */}
      <div className="flex items-center justify-between bg-[#F0F3FF] border border-[#D8E3FB] rounded-2xl p-4 shadow-xs">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-[#00362A] tracking-tight">
              Hello, Owner!
            </h1>
            <span aria-label="Waving hand" className="text-xl select-none" role="img">
              👋
            </span>
          </div>
          <p className="text-xs text-[#404945] truncate mt-0.5">
            Manage your hostel listings & student inquiries
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#124E3F] text-[#86BEAB] px-3 py-1.5 rounded-full shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[15px]">real_estate_agent</span>
          <span className="text-[11px] font-bold text-white">Owner Hub</span>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total Listings */}
        <div
          onClick={onViewAllListings}
          className="bg-white border border-[#E2E8F0] p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:border-[#006C49] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#F0F3FF] flex items-center justify-center text-[#00362A] mb-1">
            <span className="material-symbols-outlined text-[18px]">apartment</span>
          </div>
          <span className="text-2xl font-black text-[#00362A] leading-tight">
            {hostels.length}
          </span>
          <span className="text-[11px] font-medium text-[#404945] mt-0.5">Total Listings</span>
        </div>

        {/* Active Listings */}
        <div
          onClick={onViewAllListings}
          className="bg-white border border-[#E2E8F0] p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:border-[#006C49] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#6FFBBE]/40 flex items-center justify-center text-[#006C49] mb-1">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <span className="text-2xl font-black text-[#006C49] leading-tight">
            {activeHostelsCount}
          </span>
          <span className="text-[11px] font-medium text-[#404945] mt-0.5">Active</span>
        </div>

        {/* Total Inquiries */}
        <div
          onClick={onViewAllInquiries}
          className="bg-white border border-[#E2E8F0] p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:border-[#006C49] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFDDB8]/70 flex items-center justify-center text-[#653E00] mb-1">
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
          </div>
          <span className="text-2xl font-black text-[#F8A00F] leading-tight">
            {inquiries.length + 10}
          </span>
          <span className="text-[11px] font-medium text-[#404945] mt-0.5">Total Inquiries</span>
        </div>
      </div>

      {/* Primary Action: Add New Hostel */}
      <button
        type="button"
        onClick={onAddNewHostel}
        className="w-full h-12 bg-[#00362A] hover:bg-[#124E3F] active:scale-[0.99] transition-all duration-200 text-white rounded-xl flex items-center justify-center gap-2 shadow-md font-bold text-xs"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        <span>+ Add New Hostel</span>
      </button>

      {/* Quick Filter Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs transition-colors ${
            selectedFilter === 'all'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:text-[#00362A]'
          }`}
        >
          <span>All Inquiries</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedFilter === 'all' ? 'bg-[#124E3F] text-white' : 'bg-[#DEE8FF] text-[#00362A]'
            }`}
          >
            {inquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs transition-colors ${
            selectedFilter === 'unread'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:text-[#00362A]'
          }`}
        >
          <span>Unread</span>
          <span className="bg-[#6FFBBE] text-[#002113] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            3
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('scheduled')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs transition-colors ${
            selectedFilter === 'scheduled'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:text-[#00362A]'
          }`}
        >
          <span>Scheduled Visits</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('followups')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs transition-colors ${
            selectedFilter === 'followups'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:text-[#00362A]'
          }`}
        >
          <span>Follow-ups</span>
        </button>
      </div>

      {/* Call notification alert */}
      {callNotice && (
        <div className="p-3 bg-[#E8F5EE] border border-[#6CF8BB] text-[#006C49] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>{callNotice}</span>
        </div>
      )}

      {/* Recent Inquiries Section */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-[#111C2D]">Recent Inquiries</h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
          </div>

          <button
            type="button"
            onClick={onViewAllInquiries}
            className="text-xs text-[#006C49] hover:text-[#00362A] font-bold flex items-center gap-0.5 transition-colors"
          >
            See All
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Leads List */}
        <div className="flex flex-col space-y-2.5">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white border border-[#E2E8F0] p-3.5 rounded-xl shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {inq.studentAvatar ? (
                    <img
                      src={inq.studentAvatar}
                      alt={inq.studentName}
                      className="w-12 h-12 rounded-full object-cover shadow-xs bg-[#DEE8FF]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E8F5EE] text-[#006C49] border border-[#B4EFDA] flex items-center justify-center font-bold text-sm shadow-xs">
                      {inq.studentInitials}
                    </div>
                  )}
                  {inq.status === 'NEW' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111C2D] truncate">
                      {inq.studentName}
                    </span>
                    {inq.status === 'NEW' ? (
                      <span className="bg-[#6FFBBE] text-[#002113] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        New
                      </span>
                    ) : (
                      <span className="bg-[#DEE8FF] text-[#404945] text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Contacted
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#00362A] font-semibold truncate mt-0.5">
                    Interested in {inq.hostelName}
                  </p>

                  <div className="flex items-center gap-1.5 text-[#404945] text-[11px] mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {inq.timeAgo}
                    </span>
                    <span>•</span>
                    <span className="truncate">{inq.roomPreference}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenChatWithStudent(inq)}
                  aria-label={`Chat with ${inq.studentName}`}
                  className="w-10 h-10 rounded-full bg-[#F0F3FF] hover:bg-[#6FFBBE]/40 active:scale-95 text-[#00362A] flex items-center justify-center transition-all border border-[#D8E3FB]"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCall(inq.studentName)}
                  aria-label={`Call ${inq.studentName}`}
                  className="w-10 h-10 rounded-full bg-[#F0F3FF] hover:bg-[#DEE8FF] active:scale-95 text-[#404945] flex items-center justify-center transition-all border border-[#D8E3FB]"
                >
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Highlight / Direct Connection Benefit Card */}
      <div className="bg-gradient-to-r from-[#E7EEFF] to-[#F0F3FF] border border-[#D8E3FB] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#00362A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-[#00362A] truncate">
              Zero Brokerage Guarantee
            </h3>
            <p className="text-[11px] text-[#404945] truncate">
              Connect directly with verified students in Pune
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#00362A] text-[20px] shrink-0">
          arrow_forward
        </span>
      </div>
    </div>
  );
};
