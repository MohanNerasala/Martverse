'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMartStore } from '@/store/useMartStore';
import { api } from '@/lib/api';
import {
  X,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Sparkles,
  Store,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const isLoginModalOpen = useAuthStore((state) => state.isLoginModalOpen);
  const loginPromptReason = useAuthStore((state) => state.loginPromptReason);
  const closeLoginModal = useAuthStore((state) => state.closeLoginModal);
  const setAuth = useAuthStore((state) => state.setAuth);
  const showToast = useMartStore((state) => state.showToast);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.sendOtp(phone);
      if (res.success) {
        setTestOtp(res.testOtp || '123456');
        setStep('otp');
        showToast(
          'OTP Generated!',
          `Check your backend terminal: OTP is printed there. Test OTP: ${res.testOtp || '123456'}`,
          'info'
        );
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to connect to authentication service. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyOtp(phone, otp);
      if (res.success && res.token && res.user) {
        setAuth(res.token, res.user, phone);
        showToast(
          'Signed In Successfully!',
          `Welcome back to Martverse (+91 ${phone})`,
          'success'
        );
        closeLoginModal();
        // Reset state
        setStep('phone');
        setPhone('');
        setOtp('');
        setTestOtp(null);
      } else {
        setErrorMsg(res.message || 'Invalid OTP code. Please enter 123456.');
      }
    } catch {
      setErrorMsg('Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('martverse_login_skipped', 'true');
    }
    closeLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      {/* Luxury Pure White Modal Box with Bold Black Typography */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] border border-slate-200 text-slate-900 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Crisp Circular Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black flex items-center justify-center transition-all duration-200 border border-slate-200 cursor-pointer shadow-sm active:scale-90"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900">
                MART<span className="text-blue-600">VERSE</span>
              </span>
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                OTP Auth
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              3D Virtual Supermarket Account
            </p>
          </div>
        </div>

        {/* Reason Banner if triggered by Add to Cart */}
        {loginPromptReason && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="font-bold leading-relaxed">{loginPromptReason}</span>
          </div>
        )}

        {/* Step 1: Indian Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Sign in with Mobile
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Enter your 10-digit Indian mobile number to unlock 3D shopping, save your trolley & track orders.
              </p>
            </div>

            {/* Mobile Input Group */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-black text-slate-900 block">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                {/* Prefilled India +91 Badge */}
                <div className="h-12 px-3.5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-1.5 select-none text-slate-900 font-black text-sm flex-shrink-0 shadow-inner">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                {/* 10-Digit Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 font-black text-base tracking-wider outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  />
                  {phone.length === 10 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-4" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {phone.length === 10
                  ? '✓ 10 digits entered. Ready to send OTP.'
                  : `Please enter 10 digits (${phone.length}/10)`}
              </p>
            </div>

            {/* Testing Mode Terminal Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Backend Terminal Testing Notice</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When you click &quot;Get OTP&quot;, the generated OTP will be printed live in your Spring Boot backend terminal for instant testing!
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Get OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Skip Option as requested */}
              <button
                type="button"
                onClick={handleSkip}
                className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-black font-extrabold text-xs transition-all cursor-pointer active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Skip for now • Browse as Guest</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Verify OTP
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Change number</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Enter the 6-digit OTP code sent to{' '}
                <strong className="text-black">+91 {phone}</strong>
              </p>
            </div>

            {/* Prominent Test OTP Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Backend Test OTP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(testOtp || '123456')}
                  className="text-[11px] font-black bg-white hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-300 shadow-sm transition-all cursor-pointer"
                >
                  Auto-fill {testOtp || '123456'}
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-slate-900 tracking-widest">
                  {testOtp || '123456'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  (Also logged in backend terminal)
                </span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900 block">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="• • • • • •"
                className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 font-black text-xl text-center tracking-[0.4em] outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue Shopping</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-black font-extrabold text-xs transition-all cursor-pointer active:scale-[0.98] shadow-sm flex items-center justify-center"
              >
                <span>Skip for now • Browse as Guest</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
