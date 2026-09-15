import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLogin: (email: string, role: UserRole) => void;
  onNavigateToRegister: () => void;
  onContinueAsGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onNavigateToRegister,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('student@pune.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(email, role);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-6 w-full max-w-sm mx-auto">
      {/* Brand Emblem */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#00362A] text-white flex items-center justify-center shadow-lg mb-3">
          <span className="material-symbols-outlined text-[32px]">home</span>
        </div>
        <h1 className="text-2xl font-black text-[#00362A] tracking-tight">
          Stay<span className="text-[#006C49]">Direct</span>
        </h1>
        <p className="text-xs font-semibold text-[#64748B] mt-1">
          Zero Brokerage Hostels & PGs in Pune
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#111C2D] text-center mb-1">Welcome Back</h2>
        <p className="text-xs text-[#707975] text-center mb-5">
          Sign in to access your saved hostels & inquiries
        </p>

        {/* Role Selector Pill */}
        <div className="flex bg-[#F0F3FF] p-1 rounded-xl mb-4 border border-[#D8E3FB]">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'student'
                ? 'bg-white text-[#00362A] shadow-xs'
                : 'text-[#64748B] hover:text-[#111C2D]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'owner'
                ? 'bg-white text-[#00362A] shadow-xs'
                : 'text-[#64748B] hover:text-[#111C2D]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>Hostel Owner</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#111C2D]" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                mail
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-9 pr-3 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
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
                onClick={() => alert('Password reset link sent to your registered email.')}
                className="text-[11px] text-[#006C49] font-bold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#707975] text-[18px]">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-10 bg-[#F0F3FF] border border-[#E2E8F0] rounded-xl text-xs text-[#111C2D] focus:outline-none focus:bg-white focus:border-[#006C49]"
                placeholder="••••••••"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#00362A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#124E3F] transition-all active:scale-[0.99] mt-2"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Log In as {role === 'student' ? 'Student' : 'Owner'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>

          {/* Google SSO button */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#707975] text-[10px]">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLogin('rahul.google@gmail.com', role)}
            className="w-full h-11 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111C2D] flex items-center justify-center gap-2 hover:bg-[#F0F3FF] transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-5 pt-3 border-t border-[#F0F3FF]">
          <p className="text-xs text-[#707975]">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-[#006C49] font-bold hover:underline"
            >
              Sign Up Free
            </button>
          </p>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-[11px] text-[#404945] font-semibold hover:underline mt-2 inline-block"
          >
            Explore as Guest →
          </button>
        </div>
      </div>
    </div>
  );
};
