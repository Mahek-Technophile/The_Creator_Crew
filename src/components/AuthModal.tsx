import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ToneType } from '../types';
import { Phone, Mail, Lock, ArrowRight, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { register, verifyOtp, login, switchUser } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'OTP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [brandTone, setBrandTone] = useState<ToneType>('Aesthetic');
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !mobile) {
      setError('Please provide both email and mobile number');
      return;
    }
    const { tempOtp } = register(email, mobile, brandTone);
    setOtpInput(tempOtp);
    setMode('OTP');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const verified = verifyOtp(email, otpInput);
    if (verified) {
      setSuccessMsg('Account verified and created');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError('Invalid 6-digit OTP code. Check the console in the corner.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email);
    if (success) {
      setSuccessMsg('Signed in successfully');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setError('Account not found with this email. Switch to a demo account below or register.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                CC
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">The Creator Crew</h3>
                <p className="text-xs text-slate-500">
                  {mode === 'LOGIN'
                    ? 'Sign in to your account'
                    : mode === 'REGISTER'
                    ? 'Register with mobile OTP'
                    : 'Enter 6-digit verification code'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-base font-mono p-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Account Selector */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
              Pre-Seeded Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchUser('user-owner-1');
                  setSuccessMsg('Switched to Demo Creator (Owner)');
                  setTimeout(onClose, 600);
                }}
                className="flex items-center gap-2 p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-900 truncate">Creator (Owner)</div>
                  <div className="text-[11px] text-slate-500 truncate">creator@crew.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUser('user-reviewer-1');
                  setSuccessMsg('Switched to Demo Reviewer');
                  setTimeout(onClose, 600);
                }}
                className="flex items-center gap-2 p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-900 truncate">Reviewer (Team)</div>
                  <div className="text-[11px] text-slate-500 truncate">reviewer@crew.com</div>
                </div>
              </button>
            </div>
          </div>

          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@crew.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-1 text-xs text-slate-500">
                Need a new account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="text-slate-900 hover:underline font-semibold"
                >
                  Register with OTP
                </button>
              </div>
            </form>
          )}

          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Mobile Number (FR-1)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Initial Brand Tone</label>
                <select
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value as ToneType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                >
                  <option value="Aesthetic">Aesthetic</option>
                  <option value="Funny">Funny</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Send 6-Digit OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-1 text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-slate-900 hover:underline font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === 'OTP' && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  6-digit OTP dispatched to <strong>{mobile}</strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Auto-populated in dev mode for testing convenience
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Activate Account</span>
              </button>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="hover:text-slate-900"
                >
                  ← Edit Phone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { tempOtp } = register(email, mobile, brandTone);
                    setOtpInput(tempOtp);
                  }}
                  className="text-slate-900 hover:underline font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
