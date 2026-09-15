import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';

interface StudentProfileViewProps {
  profile: UserProfile;
  savedCount: number;
  userRole: UserRole;
  onToggleRole: () => void;
  onNavigateTo: (screen: string) => void;
  onLogout: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  savedCount,
  userRole,
  onToggleRole,
  onNavigateTo,
  onLogout,
}) => {
  const [showEditName, setShowEditName] = useState(false);
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college || 'Symbiosis International University, Pune');

  return (
    <div className="flex flex-col w-full pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111C2D]">My Profile</h1>
          <p className="text-xs text-[#404945]">Account & preferences</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTo('help')}
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#404945] hover:text-[#00362A] shadow-xs"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col items-center text-center relative">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#DEE8FF] ring-4 ring-[#B4EFDA]/40 shadow-sm">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowEditName(!showEditName)}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00362A] text-white flex items-center justify-center shadow-md hover:bg-[#124E3F] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>

        {showEditName ? (
          <div className="w-full max-w-xs flex flex-col gap-2 mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-1.5 text-xs text-center border rounded-lg focus:outline-none focus:border-[#006C49]"
              placeholder="Your Name"
            />
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="px-3 py-1.5 text-xs text-center border rounded-lg focus:outline-none focus:border-[#006C49]"
              placeholder="College / Workplace"
            />
            <button
              onClick={() => setShowEditName(false)}
              className="px-3 py-1 bg-[#00362A] text-white text-xs rounded-lg font-semibold"
            >
              Save Details
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold text-[#111C2D]">{name}</h2>
            <p className="text-xs text-[#404945] mt-0.5">{profile.email}</p>
            <p className="text-[11px] text-[#006C49] font-medium mt-0.5">{college}</p>
          </>
        )}

        <div className="flex items-center gap-2 mt-2.5">
          <span className="px-3 py-0.5 rounded-full bg-[#E8F5EE] text-[#006C49] text-xs font-bold border border-[#B4EFDA] flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">
              {userRole === 'student' ? 'school' : 'domain'}
            </span>
            {userRole === 'student' ? 'Student Account' : 'Hostel Owner Account'}
          </span>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 w-full border-t border-[#F0F3FF] mt-4 pt-3 gap-2">
          <div
            onClick={() => onNavigateTo('saved')}
            className="flex flex-col items-center cursor-pointer hover:bg-[#F0F3FF] py-1 rounded-lg transition-colors"
          >
            <span className="text-base font-bold text-[#00362A]">{savedCount}</span>
            <span className="text-[10px] text-[#404945]">Saved Hostels</span>
          </div>

          <div
            onClick={() => onNavigateTo('chat')}
            className="flex flex-col items-center cursor-pointer hover:bg-[#F0F3FF] py-1 rounded-lg transition-colors border-x border-[#F0F3FF]"
          >
            <span className="text-base font-bold text-[#00362A]">3</span>
            <span className="text-[10px] text-[#404945]">Inquiries Sent</span>
          </div>

          <div className="flex flex-col items-center py-1">
            <span className="text-base font-bold text-[#00362A]">Pune</span>
            <span className="text-[10px] text-[#404945]">City Hub</span>
          </div>
        </div>
      </div>

      {/* Switch to Owner / Student View Card */}
      <div className="bg-[#F0F3FF] border border-[#D8E3FB] rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00362A] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              {userRole === 'student' ? 'domain' : 'school'}
            </span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#00362A]">
              {userRole === 'student' ? 'Own a Hostel or PG?' : 'Looking for Accommodation?'}
            </h2>
            <p className="text-[11px] text-[#404945]">
              {userRole === 'student'
                ? 'Switch to Owner mode to list properties'
                : 'Switch to Student mode to browse hostels'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleRole}
          className="px-3 py-1.5 bg-[#00362A] text-white rounded-xl text-xs font-bold hover:bg-[#124E3F] transition-colors shadow-xs"
        >
          Switch
        </button>
      </div>

      {/* Navigation Menu Options */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 shadow-xs flex flex-col">
        <button
          type="button"
          onClick={() => onNavigateTo('saved')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAF9] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#006C49]">bookmark</span>
            <span className="text-xs font-bold text-[#111C2D]">Saved Hostels</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#707975]">
            <span>{savedCount} places</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTo('chat')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAF9] transition-colors text-left border-t border-[#F0F3FF]"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#006C49]">chat</span>
            <span className="text-xs font-bold text-[#111C2D]">My Inquiries & Chats</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#707975]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTo('help')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAF9] transition-colors text-left border-t border-[#F0F3FF]"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#006C49]">help</span>
            <span className="text-xs font-bold text-[#111C2D]">Help & Support FAQs</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#707975]">
            chevron_right
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTo('about')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAF9] transition-colors text-left border-t border-[#F0F3FF]"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#006C49]">info</span>
            <span className="text-xs font-bold text-[#111C2D]">About StayDirect Pune</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#707975]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Direct Host Guarantee Banner */}
      <div className="bg-[#E8F5EE] border border-[#6CF8BB] rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#006C49] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
        <p className="text-[11px] text-[#00714D] font-medium leading-tight">
          <strong>100% Zero Brokerage:</strong> StayDirect guarantees you will never pay any commission or broker fees on our platform.
        </p>
      </div>

      {/* Log Out */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full h-11 bg-white border border-[#BA1A1A]/30 text-[#BA1A1A] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FFF8F7] transition-colors shadow-xs"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span>Log Out</span>
      </button>

      {/* Version Footnote */}
      <p className="text-center text-[10px] text-[#94A3B8]">
        StayDirect for Pune • Version 1.0.0 (Direct-To-Owner)
      </p>
    </div>
  );
};
