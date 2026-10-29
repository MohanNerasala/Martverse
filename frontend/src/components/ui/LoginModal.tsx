'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMartStore } from '@/store/useMartStore';
import { api } from '@/lib/api';
import {
  X,
  ShieldCheck,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Terminal,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const isLoginModalOpen = useAuthStore((state) => state.isLoginModalOpen);
  const loginPromptReason = useAuthStore((state) => state.loginPromptReason);
  const closeLoginModal = useAuthStore((state) => state.closeLoginModal);
  const setAuth = useAuthStore((state) => state.setAuth);
  const showToast = useMartStore((state) => state.showToast);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentTestOtp, setSentTestOtp] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Auto-focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isLoginModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');

    // Handle multi-digit paste into a single box
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      const newOtpDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtpDigits[index + i] = d;
      });
      setOtpDigits(newOtpDigits);
      const nextFocus = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      if (errorMsg) setErrorMsg(null);
      return;
    }

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = cleaned;
    setOtpDigits(newOtpDigits);
    if (errorMsg) setErrorMsg(null);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData) {
      const digits = pasteData.split('');
      const newOtpDigits = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        newOtpDigits[i] = d;
      });
      setOtpDigits(newOtpDigits);
      const focusIndex = Math.min(digits.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
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
        setStep('otp');
        setCountdown(30);
        setOtpDigits(['', '', '', '', '', '']);

        if (res.testOtp) {
          setSentTestOtp(res.testOtp);
          console.log('[MARTVERSE TEST OTP FROM BACKEND]:', res.testOtp);
        }

        showToast(
          'OTP Generated',
          `Check your terminal for the code!`,
          'success'
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

  const currentOtp = otpDigits.join('');

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyOtp(phone, currentOtp);
      if (res.success && res.token && res.user) {
        setAuth(res.token, res.user, phone);
        showToast(
          'Signed In Successfully!',
          `Welcome to Martverse (+91 ${phone})`,
          'success'
        );
        closeLoginModal();
        // Reset state
        setStep('phone');
        setPhone('');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Luxury White Modal Card */}
      <div className="bg-white rounded-3xl max-w-[420px] w-full p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 text-slate-900 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Brand Logo & Close Button */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">
                MART<span className="text-blue-600">VERSE</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                3D Virtual Supermarket
              </span>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason banner if triggered by adding items to cart */}
        {loginPromptReason && (
          <div className="mb-4 bg-blue-50 border border-blue-100 text-blue-900 text-xs p-3 rounded-2xl flex items-center gap-2 font-medium">
            <span>{loginPromptReason}</span>
          </div>
        )}

        {/* Step 1: Login with Mobile */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Login
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter your mobile number to get started
              </p>
            </div>

            {/* Mobile Input Group */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                Phone Number
              </label>
              <div className="flex items-center gap-2.5">
                {/* Indian Country Badge */}
                <div className="h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-1.5 select-none text-slate-800 font-bold text-sm flex-shrink-0">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                {/* 10-Digit Phone Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 font-bold text-base tracking-wider outline-none transition-all placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                  />
                  {phone.length === 10 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-4 animate-in zoom-in duration-150" />
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center"
              >
                <span>Continue as Guest</span>
              </button>
            </div>

            {/* Real E-Commerce Legal Footer */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
              By continuing, you agree to Martverse&apos;s{' '}
              <span className="text-slate-600 font-medium hover:underline cursor-pointer">Terms of Service</span>
              {' '}&{' '}
              <span className="text-slate-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Verify OTP
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Change number</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter the 6-digit code sent to{' '}
                <strong className="text-slate-900 font-bold">+91 {phone}</strong>
              </p>
            </div>

            {/* Terminal Test Code Banner */}
            {sentTestOtp && (
              <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                      Terminal Output
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-400 tracking-widest">
                      {sentTestOtp}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = sentTestOtp.split('').slice(0, 6);
                    setOtpDigits(digits);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95 border border-slate-700"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* 6-Box Segmented OTP Inputs */}
            <div className="space-y-2">
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Countdown & Resend Option */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-medium">
                  Didn&apos;t receive code?
                </span>
                {countdown > 0 ? (
                  <span className="text-xs text-slate-400 font-medium">
                    Resend in <strong className="text-slate-600 font-bold">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading || currentOtp.length !== 6}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center"
              >
                <span>Continue as Guest</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
