import React, { useState } from 'react';
import { UserProfile } from '../types';

interface StudentProfileViewProps {
  currentUser: UserProfile | null;
  savedCount: number;
  inquiriesCount?: number;
  onOpenAuth: (role?: 'student' | 'owner', context?: string) => void;
  onNavigateTo: (screen: string) => void;
  onLogout: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  currentUser,
  savedCount,
  inquiriesCount = 0,
  onOpenAuth,
  onNavigateTo,
  onLogout,
  onUpdateProfile,
}) => {
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [collegeOrBusiness, setCollegeOrBusiness] = useState(
    currentUser?.role === 'student'
      ? currentUser?.college || ''
      : currentUser?.propertyBusinessName || ''
  );
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // 1. GUEST USER PROFILE VIEW
  if (!currentUser) {
    return (
      <div className="flex flex-col w-full max-w-lg mx-auto pb-24 space-y-4 animate-in fade-in duration-200">
        <div className="pt-2">
          <h1 className="text-xl sm:text-2xl font-black text-[#111C2D]">Account & Preferences</h1>
          <p className="text-xs text-[#5C6470]">You are currently exploring as a guest visitor</p>
        </div>

        {/* Guest Status Banner */}
        <div className="bg-white border border-[#E5E3D8] rounded-3xl p-5 sm:p-6 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EFE6] text-[#5C6470] flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">person_outline</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#111C2D]">Guest Mode Active</h2>
          <p className="text-xs text-[#5C6470] mt-1 max-w-sm mx-auto">
            You can freely search verified hostels, view room prices, and explore Pune locality maps.
            Sign in to unlock direct owner contact, shortlist saving, and visit scheduling.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              type="button"
              onClick={() => onOpenAuth('student', 'Sign in as a student to save favorite hostels and schedule physical room visits.')}
              className="py-2.5 px-3 rounded-xl bg-[#173B2C] hover:bg-[#24523F] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Student Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('owner', 'Sign in as a hostel owner to list your property and receive direct student leads.')}
              className="py-2.5 px-3 rounded-xl bg-white border border-[#B8CEAA] hover:bg-[#DCFCE7] text-[#15803D] text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              <span>Owner Sign In</span>
            </button>
          </div>
        </div>

        {/* What You Unlock by Signing In */}
        <div className="bg-white border border-[#E5E3D8] rounded-2xl p-4 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#173B2C] mb-3">
            Features Unlocked by Signing In:
          </h3>
          <div className="space-y-2.5 text-xs text-[#5C6470]">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0">
                bookmark_added
              </span>
              <span><strong>Personal Shortlist:</strong> Save hostels and compare rent, food & security.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0">
                calendar_month
              </span>
              <span><strong>Physical Visit Scheduling:</strong> Book in-person room tours directly with owners.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0">
                forum
              </span>
              <span><strong>Direct Messaging:</strong> Chat without intermediate agents or brokers.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0">
                domain_add
              </span>
              <span><strong>Hostel Owner Listing:</strong> Publish your property to 15,000+ Pune students with 0% brokerage.</span>
            </div>
          </div>
        </div>

        {/* Standard Links */}
        <div className="bg-white border border-[#E5E3D8] rounded-2xl p-1.5 shadow-2xs flex flex-col">
          <button
            type="button"
            onClick={() => onNavigateTo('about')}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#15803D]">verified</span>
              <span className="text-xs font-bold text-[#111C2D]">Zero Brokerage Guarantee</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTo('help')}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#15803D]">help</span>
              <span className="text-xs font-bold text-[#111C2D]">Help & Support FAQs</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED USER VIEW (STUDENT OR OWNER)
  const isStudent = currentUser.role === 'student';

  const handleSaveDetails = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        name: name.trim() || currentUser.name,
        phone: phone.trim() || currentUser.phone,
        college: isStudent ? (collegeOrBusiness.trim() || currentUser.college) : undefined,
        propertyBusinessName: !isStudent ? (collegeOrBusiness.trim() || currentUser.propertyBusinessName) : undefined,
      });
    }
    setShowEdit(false);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-24 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111C2D]">
            {isStudent ? 'Student Profile' : 'Hostel Owner Account'}
          </h1>
          <p className="text-xs text-[#5C6470]">Manage your verified identity & preferences</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTo('help')}
          aria-label="Settings"
          className="w-9 h-9 rounded-xl bg-white border border-[#E5E3D8] flex items-center justify-center text-[#5C6470] hover:text-[#173B2C] shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white border border-[#E5E3D8] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col items-center text-center relative">
        <div className="relative mb-3">
          <div
            className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black shadow-md ${
              isStudent
                ? 'bg-[#DCFCE7] text-[#15803D] ring-4 ring-[#B8CEAA]/50'
                : 'bg-[#173B2C] text-white ring-4 ring-[#173B2C]/20'
            }`}
          >
            {currentUser.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'SD'}
          </div>
          <button
            type="button"
            onClick={() => setShowEdit(!showEdit)}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#173B2C] text-white flex items-center justify-center shadow-md hover:bg-[#24523F] transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
        </div>

        {showEdit ? (
          <div className="w-full max-w-xs flex flex-col gap-2 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-1.5 text-xs text-center border border-[#E5E3D8] rounded-xl focus:outline-none focus:border-[#173B2C]"
              placeholder="Your Name"
            />
            <input
              type="text"
              value={collegeOrBusiness}
              onChange={(e) => setCollegeOrBusiness(e.target.value)}
              className="px-3 py-1.5 text-xs text-center border border-[#E5E3D8] rounded-xl focus:outline-none focus:border-[#173B2C]"
              placeholder={isStudent ? 'College / University' : 'Property Business Name'}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-1.5 text-xs text-center border border-[#E5E3D8] rounded-xl focus:outline-none focus:border-[#173B2C]"
              placeholder="Contact Phone"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDetails}
                className="flex-1 py-1.5 bg-[#173B2C] text-white text-xs rounded-xl font-bold hover:bg-[#24523F] cursor-pointer"
              >
                Save Details
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-3 py-1.5 bg-[#F1EFE6] text-[#5C6470] text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-base sm:text-lg font-black text-[#111C2D]">
              {currentUser.name}
            </h2>
            <p className="text-xs text-[#5C6470] mt-0.5">{currentUser.email}</p>
            <p className="text-xs font-bold text-[#15803D] mt-0.5">
              {isStudent ? currentUser.college : currentUser.propertyBusinessName}
            </p>
            {currentUser.phone && (
              <p className="text-[11px] text-[#8E95A2] mt-0.5">{currentUser.phone}</p>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-2.5">
          <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-black border border-[#B8CEAA] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">
              {isStudent ? 'school' : 'domain'}
            </span>
            <span>{isStudent ? 'Verified Student Account' : 'Verified Hostel Owner'}</span>
          </span>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 w-full border-t border-[#E5E3D8] mt-4 pt-3 gap-2">
          {isStudent ? (
            <>
              <div
                onClick={() => onNavigateTo('saved')}
                className="flex flex-col items-center cursor-pointer hover:bg-[#F8F7F1] py-1 rounded-xl transition-colors"
              >
                <span className="text-base font-black text-[#173B2C]">{savedCount}</span>
                <span className="text-[10px] text-[#5C6470]">Saved Hostels</span>
              </div>

              <div
                onClick={() => onNavigateTo('chat')}
                className="flex flex-col items-center cursor-pointer hover:bg-[#F8F7F1] py-1 rounded-xl transition-colors border-x border-[#E5E3D8]"
              >
                <span className="text-base font-black text-[#173B2C]">{inquiriesCount}</span>
                <span className="text-[10px] text-[#5C6470]">Visits Booked</span>
              </div>

              <div className="flex flex-col items-center py-1">
                <span className="text-base font-black text-[#173B2C]">₹0</span>
                <span className="text-[10px] text-[#5C6470]">Brokerage Paid</span>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => onNavigateTo('owner-listings')}
                className="flex flex-col items-center cursor-pointer hover:bg-[#F8F7F1] py-1 rounded-xl transition-colors"
              >
                <span className="text-base font-black text-[#173B2C]">2</span>
                <span className="text-[10px] text-[#5C6470]">Hostel Listings</span>
              </div>

              <div
                onClick={() => onNavigateTo('owner-inquiries')}
                className="flex flex-col items-center cursor-pointer hover:bg-[#F8F7F1] py-1 rounded-xl transition-colors border-x border-[#E5E3D8]"
              >
                <span className="text-base font-black text-[#173B2C]">{inquiriesCount || 4}</span>
                <span className="text-[10px] text-[#5C6470]">Student Inquiries</span>
              </div>

              <div className="flex flex-col items-center py-1">
                <span className="text-base font-black text-[#15803D]">100%</span>
                <span className="text-[10px] text-[#5C6470]">Direct Enquiries</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Links */}
      <div className="bg-white border border-[#E5E3D8] rounded-2xl p-1.5 shadow-2xs flex flex-col">
        {isStudent ? (
          <>
            <button
              type="button"
              onClick={() => onNavigateTo('saved')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">bookmark</span>
                <span className="text-xs font-bold text-[#111C2D]">Saved Hostels Shortlist</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#5C6470]">
                <span>{savedCount} places</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTo('chat')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">chat</span>
                <span className="text-xs font-bold text-[#111C2D]">Direct Owner Messages & Visits</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onNavigateTo('owner-home')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">dashboard</span>
                <span className="text-xs font-bold text-[#111C2D]">Owner Hub Dashboard</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTo('owner-listings')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">apartment</span>
                <span className="text-xs font-bold text-[#111C2D]">Manage Hostel Listings</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTo('owner-inquiries')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">forum</span>
                <span className="text-xs font-bold text-[#111C2D]">Student Inquiries & Bookings</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTo('add-hostel')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#15803D]">add_circle</span>
                <span className="text-xs font-bold text-[#111C2D]">Add New Hostel Listing</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onNavigateTo('about')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#15803D]">verified</span>
            <span className="text-xs font-bold text-[#111C2D]">About StayDirect & 0% Brokerage</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTo('help')}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F7F1] transition-colors text-left border-t border-[#E5E3D8] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#15803D]">support_agent</span>
            <span className="text-xs font-bold text-[#111C2D]">Help & Support FAQs</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">chevron_right</span>
        </button>
      </div>

      {/* Zero Brokerage Assurance */}
      <div className="bg-[#DCFCE7]/40 border border-[#B8CEAA] rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#173B2C] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
        <p className="text-[11px] text-[#15803D] font-bold leading-tight">
          <strong>100% Zero Brokerage:</strong> StayDirect guarantees you will never pay any commission or broker fees on our platform.
        </p>
      </div>

      {/* Log Out */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full h-11 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span>Sign Out of Account</span>
      </button>

      {/* Version Footnote */}
      <p className="text-center text-[10px] text-[#8E95A2]">
        StayDirect Pune • Authenticated Session • Production v2.0
      </p>
    </div>
  );
};
