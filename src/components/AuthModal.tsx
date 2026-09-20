import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_STUDENT_PROFILE, DEFAULT_OWNER_PROFILE } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialRole?: 'student' | 'owner';
  contextMessage?: string;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'student',
  contextMessage,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'owner'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeOrProperty, setCollegeOrProperty] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickDemoLogin = (demoRole: 'student' | 'owner') => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      if (demoRole === 'student') {
        onSuccess(DEFAULT_STUDENT_PROFILE);
      } else {
        onSuccess(DEFAULT_OWNER_PROFILE);
      }
      onClose();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || (role === 'student' ? 'Pune Student' : 'Pune Property Owner'),
        email: email.trim().toLowerCase(),
        role: role,
        avatarUrl:
          role === 'student'
            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfNAcCSE6On4K34OgPbjMNCMeU22coQrVYAt6jkdEVO0yJHzIQo85UWHa1SXz3mOiATqytjLhjDBlCIR-9o7G-m7zEfXfdOSGDJMQD_iH1MdAtmkq4v_BqdwA2ucy6QSjUky8GieDdS6gqbSgZ-gUs20WmgoQwkOMThq6TCnwp4k3B8-DQIBLG5FMjcSLken2FJ5oQQY9JgvIXmFu9KTOOf0SmLgwCOcR0SDYekeIErD-wJtEHSUem'
            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj1abmB_TLl-6V4esxg59a5Sm05EY8FMdub-GK5NX9kQc7cCNCKccdRsOvXI6NVVLq1SB_EkiJzP-auKu0nOr6auciBKMzKiqxL6WNeyUh_vKkC8Mn3ZOPk7zIQsu1Qya4un-bVJNxW0vPdyyY4DB9G0Y_LNOWKYVlmRzUSPEDrrHmysDgmQ-P0QDCOfTvXQhwJSoRQAMc2Xd-xBvPyVE1RbGmusBHGeYNlNmMEluDhbjF3jm-bTgq',
        savedCount: 0,
        inquiriesCount: 0,
        city: 'Pune',
        college: role === 'student' ? (collegeOrProperty || 'Pune University / College') : undefined,
        phone: phone || '+91 98000 00000',
        propertyBusinessName: role === 'owner' ? (collegeOrProperty || 'Verified Pune Stay') : undefined,
      };

      onSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#E5E3D8] overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F1EFE6] text-[#5C6470] hover:text-[#111C2D] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Brand Header */}
        <div className="text-center pt-1 pb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-[#00362A]/20 mb-2.5 bg-[#00362A]">
            <img
              src="/icon.svg"
              alt="StayDirect Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111C2D] tracking-tight">
            {mode === 'login' ? 'Sign In to StayDirect' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-[#5C6470] mt-1 max-w-xs mx-auto">
            {contextMessage ||
              (role === 'student'
                ? 'Unlock 0% brokerage hostels, direct owner chats & physical room visits.'
                : 'List your Pune hostel or PG, manage vacancies & connect directly with students.')}
          </p>
        </div>

        {/* Mode Toggle: Login vs Register */}
        <div className="flex bg-[#F1EFE6] p-1 rounded-xl mb-4 border border-[#E5E3D8] shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#173B2C] shadow-xs'
                : 'text-[#5C6470] hover:text-[#111C2D]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-[#173B2C] shadow-xs'
                : 'text-[#5C6470] hover:text-[#111C2D]'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Role Selector: Student vs Owner */}
        <div className="mb-4 shrink-0">
          <label className="text-[11px] font-bold text-[#5C6470] uppercase tracking-wider block mb-1.5">
            Choose Your Role:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                role === 'student'
                  ? 'border-[#173B2C] bg-[#DCFCE7]/40 text-[#173B2C]'
                  : 'border-[#E5E3D8] bg-white text-[#5C6470] hover:border-[#173B2C]/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  role === 'student' ? 'bg-[#173B2C] text-white' : 'bg-[#F1EFE6] text-[#5C6470]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-black truncate">Student</span>
                <span className="block text-[10px] text-[#5C6470] truncate">Find hostels</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                role === 'owner'
                  ? 'border-[#173B2C] bg-[#DCFCE7]/40 text-[#173B2C]'
                  : 'border-[#E5E3D8] bg-white text-[#5C6470] hover:border-[#173B2C]/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  role === 'owner' ? 'bg-[#173B2C] text-white' : 'bg-[#F1EFE6] text-[#5C6470]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">domain</span>
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-black truncate">Hostel Owner</span>
                <span className="block text-[10px] text-[#5C6470] truncate">List & manage</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick 1-Click Demo Logins for instant evaluation */}
        <div className="mb-4 bg-[#F8F7F1] p-3 rounded-2xl border border-[#E5E3D8] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-[#173B2C] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              1-Click Demo Evaluation:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white border border-[#B8CEAA] hover:bg-[#DCFCE7]/60 text-[#173B2C] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Login as Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('owner')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white border border-[#173B2C] hover:bg-[#173B2C] hover:text-white text-[#173B2C] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">domain</span>
              <span>Login as Owner</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-3 shrink-0">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E3D8]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 font-bold text-[#8E95A2]">Or use your credentials</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3 flex-1 pr-0.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#111C2D] block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Sunil Patil'}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E3D8] bg-[#F8F7F1] text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-xl border border-[#E5E3D8] bg-[#F8F7F1] text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#111C2D] block mb-1">
                {role === 'student' ? 'College / University' : 'Property / Hostel Name'}
              </label>
              <input
                type="text"
                value={collegeOrProperty}
                onChange={(e) => setCollegeOrProperty(e.target.value)}
                placeholder={role === 'student' ? 'e.g. MIT-WPU, COEP, Symbiosis' : 'e.g. Sunrise Luxury PG'}
                className="w-full h-10 px-3 rounded-xl border border-[#E5E3D8] bg-[#F8F7F1] text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#111C2D] block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98234 XXXXX"
                className="w-full h-10 px-3 rounded-xl border border-[#E5E3D8] bg-[#F8F7F1] text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#111C2D] block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-3 pr-10 rounded-xl border border-[#E5E3D8] bg-[#F8F7F1] text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8E95A2] hover:text-[#111C2D]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#173B2C] hover:bg-[#24523F] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? `Sign In as ${role === 'student' ? 'Student' : 'Owner'}`
                    : `Create ${role === 'student' ? 'Student' : 'Owner'} Account`}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
