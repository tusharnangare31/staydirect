import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_STUDENT_PROFILE, DEFAULT_OWNER_PROFILE } from '../data/mockData';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onContinueAsGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onNavigateToRegister,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('rahul.sharma@mitwpu.edu');
  const [password, setPassword] = useState('pune1234');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: 'student' | 'owner') => {
    setRole(newRole);
    if (newRole === 'student') {
      setEmail('rahul.sharma@mitwpu.edu');
    } else {
      setEmail('sunil.patil@staydirect.in');
    }
  };

  const handleQuickDemo = (demoRole: 'student' | 'owner') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (demoRole === 'student') {
        onLogin(DEFAULT_STUDENT_PROFILE);
      } else {
        onLogin(DEFAULT_OWNER_PROFILE);
      }
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

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (role === 'student' && email.toLowerCase().includes('rahul')) {
        onLogin(DEFAULT_STUDENT_PROFILE);
      } else if (role === 'owner' && email.toLowerCase().includes('sunil')) {
        onLogin(DEFAULT_OWNER_PROFILE);
      } else {
        // Custom credentials
        const user: UserProfile = {
          id: `user-${Date.now()}`,
          name: role === 'student' ? 'Pune Student' : 'Pune Property Owner',
          email: email.trim().toLowerCase(),
          role: role,
          avatarUrl:
            role === 'student'
              ? DEFAULT_STUDENT_PROFILE.avatarUrl
              : DEFAULT_OWNER_PROFILE.avatarUrl,
          savedCount: 0,
          inquiriesCount: 0,
          city: 'Pune',
          college: role === 'student' ? 'Pune University' : undefined,
          phone: '+91 98220 XXXXX',
          propertyBusinessName: role === 'owner' ? 'Direct Pune Hostels' : undefined,
        };
        onLogin(user);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 w-full max-w-md mx-auto">
      {/* Brand Emblem */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md mb-3 border border-[#00362A]/20 bg-[#00362A]">
          <img
            src="/icon.svg"
            alt="StayDirect Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-[#111C2D] tracking-tight">
          Stay<span className="text-[#173B2C]">Direct</span>
        </h1>
        <p className="text-xs font-bold text-[#15803D] mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span>Zero Brokerage • Direct Student & Owner Platform</span>
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="text-center mb-4">
          <h2 className="text-lg font-black text-[#111C2D]">Sign In</h2>
          <p className="text-xs text-[#5C6470] mt-0.5">
            Select your account type to access role-specific features
          </p>
        </div>

        {/* Role Selector Pill */}
        <div className="flex bg-[#F1EFE6] p-1 rounded-xl mb-4 border border-[#E5E3D8]">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'student'
                ? 'bg-white text-[#173B2C] shadow-xs'
                : 'text-[#5C6470] hover:text-[#111C2D]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('owner')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'owner'
                ? 'bg-white text-[#173B2C] shadow-xs'
                : 'text-[#5C6470] hover:text-[#111C2D]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>Hostel Owner</span>
          </button>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="mb-4 bg-[#F8F7F1] p-3 rounded-2xl border border-[#E5E3D8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#173B2C] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Instant 1-Click Evaluation:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              disabled={isSubmitting}
              className="p-2 rounded-xl bg-white border border-[#B8CEAA] hover:bg-[#DCFCE7] text-[#173B2C] text-xs font-bold flex flex-col items-center justify-center shadow-2xs transition-all cursor-pointer"
            >
              <span className="font-extrabold">Rahul Sharma</span>
              <span className="text-[10px] text-[#5C6470]">Student (MIT-WPU)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              disabled={isSubmitting}
              className="p-2 rounded-xl bg-white border border-[#173B2C] hover:bg-[#173B2C] hover:text-white text-[#173B2C] text-xs font-bold flex flex-col items-center justify-center shadow-2xs transition-all cursor-pointer group"
            >
              <span className="font-extrabold">Sunil Patil</span>
              <span className="text-[10px] text-[#5C6470] group-hover:text-white/80">Owner (Sunrise PG)</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E3D8]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 font-bold text-[#8E95A2]">Or Enter Credentials</span>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111C2D]" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset verification link sent to your email.')}
                className="text-[11px] text-[#15803D] font-bold hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-10 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#8E95A2] hover:text-[#111C2D] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#173B2C] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#24523F] transition-all active:scale-[0.99] mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In as {role === 'student' ? 'Student' : 'Owner'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-5 pt-4 border-t border-[#E5E3D8] flex flex-col gap-2">
          <p className="text-xs text-[#5C6470]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-[#15803D] font-black hover:underline cursor-pointer"
            >
              Sign Up Free
            </button>
          </p>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-xs text-[#5C6470] font-bold hover:text-[#173B2C] hover:underline cursor-pointer"
          >
            ← Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
