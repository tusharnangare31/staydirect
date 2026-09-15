import React, { useState } from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Visit Slot Confirmed',
      text: 'Sunil Patil has confirmed your physical walkthrough for Sunrise PG tomorrow at 4:00 PM.',
      time: '15m ago',
      unread: true,
      icon: 'calendar_month',
    },
    {
      id: 2,
      title: 'New Student Inquiry',
      text: 'Priya Patel is asking about single room availability and meal plans at Sunrise PG.',
      time: '2h ago',
      unread: true,
      icon: 'forum',
    },
    {
      id: 3,
      title: 'Zero Brokerage Audit Passed',
      text: '12 new hostels in Kothrud & Viman Nagar verified with zero middleman fee assurance.',
      time: '1d ago',
      unread: false,
      icon: 'verified',
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F3FF]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00362A] text-[20px]">
              notifications
            </span>
            <h3 className="text-sm font-bold text-[#111C2D]">Notifications</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] text-[#006C49] font-bold hover:underline px-2 py-1"
            >
              Mark read
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#707975] hover:bg-[#F0F3FF]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 py-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl flex items-start gap-3 transition-colors ${
                item.unread ? 'bg-[#E8F5EE]/50 border border-[#B4EFDA]' : 'bg-[#F8FAF9]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#00362A] text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111C2D]">{item.title}</span>
                  <span className="text-[10px] text-[#707975]">{item.time}</span>
                </div>
                <p className="text-[11px] text-[#404945] mt-0.5 leading-snug">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 bg-[#F0F3FF] text-[#00362A] font-bold text-xs rounded-xl hover:bg-[#DEE8FF] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
