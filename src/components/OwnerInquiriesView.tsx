import React, { useState } from 'react';
import { Inquiry } from '../types';

interface OwnerInquiriesViewProps {
  inquiries: Inquiry[];
  onOpenChat: (inquiry: Inquiry) => void;
}

export const OwnerInquiriesView: React.FC<OwnerInquiriesViewProps> = ({
  inquiries,
  onOpenChat,
}) => {
  const [tab, setTab] = useState<'all' | 'new' | 'contacted'>('all');
  const [query, setQuery] = useState('');
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const filtered = inquiries.filter((inq) => {
    if (tab === 'new' && inq.status !== 'NEW') return false;
    if (tab === 'contacted' && inq.status !== 'CONTACTED' && inq.status !== 'SCHEDULED') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        inq.studentName.toLowerCase().includes(q) ||
        inq.hostelName.toLowerCase().includes(q) ||
        inq.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCall = (studentName: string) => {
    setCallNotice(`Direct connect initiated with ${studentName}. Zero brokerage call launched.`);
    setTimeout(() => setCallNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-28 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">Student Inquiries</h1>
          <p className="text-xs text-[#404945]">Direct leads with zero brokerage</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#006C49] text-xs font-bold border border-[#B4EFDA]">
          {inquiries.length} Active Leads
        </span>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student name or hostel..."
          className="w-full h-11 pl-9 pr-4 bg-white rounded-xl text-xs text-[#111C2D] border border-[#E2E8F0] shadow-xs focus:outline-none focus:border-[#006C49]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
            tab === 'all'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:bg-[#F0F3FF]'
          }`}
        >
          All ({inquiries.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('new')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
            tab === 'new'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:bg-[#F0F3FF]'
          }`}
        >
          New ({inquiries.filter((i) => i.status === 'NEW').length})
        </button>

        <button
          type="button"
          onClick={() => setTab('contacted')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
            tab === 'contacted'
              ? 'bg-[#00362A] text-white'
              : 'bg-white text-[#404945] border border-[#E2E8F0] hover:bg-[#F0F3FF]'
          }`}
        >
          Contacted ({inquiries.filter((i) => i.status === 'CONTACTED' || i.status === 'SCHEDULED').length})
        </button>
      </div>

      {callNotice && (
        <div className="p-3 bg-[#E8F5EE] border border-[#6CF8BB] text-[#006C49] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>{callNotice}</span>
        </div>
      )}

      {/* Inquiries List */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#707975] mb-1">
              forum
            </span>
            <p className="text-sm font-bold text-[#111C2D]">No inquiries found</p>
            <p className="text-xs text-[#404945] mt-1">Try switching tabs or adjusting search query.</p>
          </div>
        ) : (
          filtered.map((inq) => (
            <div
              key={inq.id}
              className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl shadow-xs flex flex-col gap-2.5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {inq.studentAvatar ? (
                    <img
                      src={inq.studentAvatar}
                      alt={inq.studentName}
                      className="w-11 h-11 rounded-full object-cover shadow-xs bg-[#DEE8FF]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#E8F5EE] text-[#006C49] border border-[#B4EFDA] flex items-center justify-center font-bold text-sm shadow-xs">
                      {inq.studentInitials}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#111C2D]">{inq.studentName}</h2>
                      {inq.status === 'NEW' ? (
                        <span className="bg-[#6FFBBE] text-[#002113] text-[10px] px-2 py-0.2 rounded-full font-bold">
                          NEW
                        </span>
                      ) : (
                        <span className="bg-[#DEE8FF] text-[#404945] text-[10px] px-2 py-0.2 rounded-full font-medium">
                          {inq.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#00362A] mt-0.5">
                      Interested in {inq.hostelName}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-[#707975] shrink-0">{inq.timeAgo}</span>
              </div>

              {/* Message excerpt */}
              <div className="bg-[#F8FAF9] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                <p className="text-xs text-[#404945] italic line-clamp-2">
                  &ldquo;{inq.lastMessage}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#707975]">
                  <span>Pref: {inq.roomPreference}</span>
                  {inq.moveInDate && <span>• Move-in: {inq.moveInDate}</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenChat(inq)}
                  className="flex-1 h-9 rounded-xl bg-[#00362A] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#124E3F] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  Open Chat
                </button>

                <button
                  type="button"
                  onClick={() => handleCall(inq.studentName)}
                  className="h-9 px-4 rounded-xl bg-[#F0F3FF] text-[#00362A] text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#DEE8FF] transition-colors border border-[#D8E3FB]"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
