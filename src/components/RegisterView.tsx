import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';

interface RegisterViewProps {
  onRegister: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  onContinueAsGuest?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegister,
  onNavigateToLogin,
  onContinueAsGuest,
}) => {
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeOrProperty, setCollegeOrProperty] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (!agreed) {
      setError('Please agree to terms and 0% brokerage policy');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        avatarUrl:
          role === 'student'
            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfNAcCSE6On4K34OgPbjMNCMeU22coQrVYAt6jkdEVO0yJHzIQo85UWHa1SXz3mOiATqytjLhjDBlCIR-9o7G-m7zEfXfdOSGDJMQD_iH1MdAtmkq4v_BqdwA2ucy6QSjUky8GieDdS6gqbSgZ-gUs20WmgoQwkOMThq6TCnwp4k3B8-DQIBLG5FMjcSLken2FJ5oQQY9JgvIXmFu9KTOOf0SmLgwCOcR0SDYekeIErD-wJtEHSUem'
            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj1abmB_TLl-6V4esxg59a5Sm05EY8FMdub-GK5NX9kQc7cCNCKccdRsOvXI6NVVLq1SB_EkiJzP-auKu0nOr6auciBKMzKiqxL6WNeyUh_vKkC8Mn3ZOPk7zIQsu1Qya4un-bVJNxW0vPdyyY4DB9G0Y_LNOWKYVlmRzUSPEDrrHmysDgmQ-P0QDCOfTvXQhwJSoRQAMc2Xd-xBvPyVE1RbGmusBHGeYNlNmMEluDhbjF3jm-bTgq',
        savedCount: 0,
        inquiriesCount: 0,
        city: 'Pune',
        college: role === 'student' ? collegeOrProperty || 'Pune College' : undefined,
        phone: phone || '+91 98000 00000',
        propertyBusinessName: role === 'owner' ? collegeOrProperty || 'Pune Verified Stay' : undefined,
      };
      onRegister(newUser);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md mb-2 border border-[#00362A]/20 bg-[#00362A]">
          <img
            src="/icon.svg"
            alt="StayDirect Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-[#111C2D] tracking-tight">Create Account</h1>
        <p className="text-xs font-semibold text-[#5C6470] mt-0.5">
          Join Pune&apos;s direct student accommodation network
        </p>
      </div>

      <div className="w-full bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-7 shadow-xl">
        {/* Role Choice Cards */}
        <label className="text-xs font-bold text-[#111C2D] block mb-2">I am joining as a:</label>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div
            onClick={() => setRole('student')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              role === 'student'
                ? 'border-[#173B2C] bg-[#DCFCE7]/40'
                : 'border-[#E5E3D8] bg-white hover:border-[#173B2C]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="material-symbols-outlined text-[#173B2C] text-[22px]">school</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  role === 'student' ? 'border-[#173B2C] bg-[#173B2C]' : 'border-[#94A3B8]'
                }`}
              >
                {role === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#111C2D]">Student</span>
            <span className="text-[10px] text-[#5C6470] mt-0.5">Find hostel in Pune</span>
          </div>

          <div
            onClick={() => setRole('owner')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              role === 'owner'
                ? 'border-[#173B2C] bg-[#DCFCE7]/40'
                : 'border-[#E5E3D8] bg-white hover:border-[#173B2C]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="material-symbols-outlined text-[#173B2C] text-[22px]">domain</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  role === 'owner' ? 'border-[#173B2C] bg-[#173B2C]' : 'border-[#94A3B8]'
                }`}
              >
                {role === 'owner' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#111C2D]">Hostel Owner</span>
            <span className="text-[10px] text-[#5C6470] mt-0.5">List & manage rooms</span>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-name">
              Full Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                person
              </span>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Sunil Patil'}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                mail
              </span>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* College or Property */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-college">
              {role === 'student' ? 'College / University' : 'Property / Hostel Business Name'}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                {role === 'student' ? 'school' : 'apartment'}
              </span>
              <input
                id="reg-college"
                type="text"
                value={collegeOrProperty}
                onChange={(e) => setCollegeOrProperty(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder={
                  role === 'student'
                    ? 'e.g. MIT-WPU, COEP, Symbiosis, Bharati'
                    : 'e.g. Sunrise PG & Hostels'
                }
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-phone">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                phone
              </span>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder="+91 98230 XXXXX"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-pass">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#8E95A2] text-[18px]">
                lock
              </span>
              <input
                id="reg-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-10 bg-[#F8F7F1] border border-[#E5E3D8] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#173B2C]"
                placeholder="Create secure password"
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

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 mt-1">
            <input
              id="terms-check"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-[#173B2C] focus:ring-[#173B2C] cursor-pointer"
            />
            <label htmlFor="terms-check" className="text-[11px] text-[#5C6470] leading-tight cursor-pointer">
              I agree to the StayDirect Pune Zero Brokerage Terms of Service and Privacy Policy
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#173B2C] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#24523F] transition-all active:scale-[0.99] mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Creating your account...</span>
              </div>
            ) : (
              <>
                <span>Register as {role === 'student' ? 'Student' : 'Owner'}</span>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-[#E5E3D8] flex flex-col gap-2">
          <p className="text-xs text-[#5C6470]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#15803D] font-bold hover:underline cursor-pointer"
            >
              Log In
            </button>
          </p>
          {onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-[#5C6470] font-bold hover:text-[#173B2C] hover:underline cursor-pointer"
            >
              ← Continue Browsing as Guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
