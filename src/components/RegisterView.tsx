import React, { useState } from 'react';
import { UserRole } from '../types';

interface RegisterViewProps {
  onRegister: (name: string, email: string, role: UserRole) => void;
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to terms and privacy policy to continue.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onRegister(name || 'Rahul Sharma', email || 'student@pune.ac.in', role);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-6 w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#00362A] text-white flex items-center justify-center shadow-md mb-2">
          <span className="material-symbols-outlined text-[28px]">home</span>
        </div>
        <h1 className="text-2xl font-black text-[#00362A] tracking-tight">Create Account</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Join 15,000+ Pune students and direct hostel owners
        </p>
      </div>

      <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
        {/* Role Choice Cards */}
        <label className="text-xs font-bold text-[#111C2D] block mb-2">I am joining as a:</label>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div
            onClick={() => setRole('student')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              role === 'student'
                ? 'border-[#00362A] bg-[#E8F5EE]/60'
                : 'border-[#E2E8F0] bg-white hover:border-[#B4EFDA]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="material-symbols-outlined text-[#00362A] text-[22px]">school</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  role === 'student' ? 'border-[#00362A] bg-[#00362A]' : 'border-[#94A3B8]'
                }`}
              >
                {role === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#111C2D]">Student</span>
            <span className="text-[10px] text-[#64748B] mt-0.5">Find hostel in Pune</span>
          </div>

          <div
            onClick={() => setRole('owner')}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              role === 'owner'
                ? 'border-[#00362A] bg-[#E8F5EE]/60'
                : 'border-[#E2E8F0] bg-white hover:border-[#B4EFDA]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="material-symbols-outlined text-[#00362A] text-[22px]">domain</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  role === 'owner' ? 'border-[#00362A] bg-[#00362A]' : 'border-[#94A3B8]'
                }`}
              >
                {role === 'owner' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#111C2D]">Hostel Owner</span>
            <span className="text-[10px] text-[#64748B] mt-0.5">List & manage rooms</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-name">
              Full Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                person
              </span>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
                placeholder="Rahul Sharma"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                mail
              </span>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
                placeholder="rahul@gmail.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-phone">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                phone
              </span>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
                placeholder="+91 98230 12345"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="reg-pass">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                lock
              </span>
              <input
                id="reg-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-10 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
                placeholder="Create secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#707975] hover:text-[#111C2D]"
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
              className="mt-0.5 rounded text-[#00362A] focus:ring-[#006C49]"
            />
            <label htmlFor="terms-check" className="text-[11px] text-[#404945] leading-tight">
              I agree to the StayDirect Pune Zero Brokerage Terms of Service and Privacy Policy
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#00362A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#124E3F] transition-all active:scale-[0.99] mt-2"
          >
            {isSubmitting ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-[#F0F3FF]">
          <p className="text-xs text-[#707975]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#006C49] font-bold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
