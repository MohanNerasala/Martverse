'use client';

import React, { useState, useEffect } from 'react';
import { useBillingStore } from '@/store/useBillingStore';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import {
  Barcode,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  X,
  CreditCard,
  Truck,
  Store,
  User,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Check,
  Receipt,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { api } from '@/lib/api';

export const BillingModal: React.FC = () => {
  const phase = useBillingStore((state) => state.phase);
  const isPaused = useBillingStore((state) => state.isPaused);
  const scannedItems = useBillingStore((state) => state.scannedItems);
  const currentIndex = useBillingStore((state) => state.currentIndex);
  const totalToScan = useBillingStore((state) => state.totalToScan);
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const isValidatingBackend = useBillingStore((state) => state.isValidatingBackend);
  const backendQuote = useBillingStore((state) => state.backendQuote);
  const completedOrder = useBillingStore((state) => state.completedOrder);

  const pauseScanning = useBillingStore((state) => state.pauseScanning);
  const resumeScanning = useBillingStore((state) => state.resumeScanning);
  const updateScannedItemQuantity = useBillingStore((state) => state.updateScannedItemQuantity);
  const removeScannedItem = useBillingStore((state) => state.removeScannedItem);
  const proceedToCheckoutDetails = useBillingStore((state) => state.proceedToCheckoutDetails);
  const backToReview = useBillingStore((state) => state.backToReview);
  const startProcessingPayment = useBillingStore((state) => state.startProcessingPayment);
  const setPaymentSuccess = useBillingStore((state) => state.setPaymentSuccess);
  const resetBilling = useBillingStore((state) => state.resetBilling);
  const revalidateCartWithBackend = useBillingStore((state) => state.revalidateCartWithBackend);

  const startExitAnimation = useMartStore((state) => state.startExitAnimation);
  const setCameraMode = useMartStore((state) => state.setCameraMode);

  // Customer Form state
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [fulfilmentType, setFulfilmentType] = useState<'DELIVERY' | 'STORE_PICKUP'>('DELIVERY');
  const [addressLine1, setAddressLine1] = useState('Flat 402, Green Glen Heights, Outer Ring Rd');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('560103');
  const [formError, setFormError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Revalidate with backend when opening review or checkout details
  useEffect(() => {
    if (phase === 'review' || phase === 'checkout_details') {
      revalidateCartWithBackend();
    }
  }, [phase, revalidateCartWithBackend]);

  // Trigger celebration confetti on payment success
  useEffect(() => {
    if (phase === 'success_popup') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [phase]);

  if (phase === 'idle') return null;

  // Calculate live review totals if backend totals are still loading
  const clientSubtotal = scannedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const clientMrpTotal = scannedItems.reduce((acc, it) => acc + it.mrp * it.quantity, 0);
  const clientDiscount = Math.max(0, clientMrpTotal - clientSubtotal);
  const clientDelivery = fulfilmentType === 'STORE_PICKUP' || clientSubtotal >= 499 ? 0 : 40;
  const clientGrandTotal = clientSubtotal + clientDelivery;

  const activeSubtotal = backendQuote?.subtotal ?? clientSubtotal;
  const activeDiscount = backendQuote?.discountAmount ?? clientDiscount;
  const activeDelivery = fulfilmentType === 'STORE_PICKUP' ? 0 : (backendQuote?.deliveryCharge ?? clientDelivery);
  const activeTotalAmount = backendQuote ? (backendQuote.totalAmount || (backendQuote.subtotal + activeDelivery)) : clientGrandTotal;

  const handleCancelBilling = () => {
    resetBilling();
    setCameraMode('third_person');
  };

  const handleProceedToPay = async () => {
    if (!customerName.trim()) {
      setFormError('Please enter the customer name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (fulfilmentType === 'DELIVERY' && !addressLine1.trim()) {
      setFormError('Delivery address is required when Home Delivery is selected.');
      return;
    }

    setFormError(null);
    setIsButtonDisabled(true); // Disable button to prevent duplicate clicks
    startProcessingPayment();

    try {
      const orderRes = await api.checkoutSimulated({
        customerName,
        customerPhone,
        fulfilmentType,
        addressLine1,
        city,
        state,
        pinCode,
        items: scannedItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
        })),
      });

      // Smooth simulated transaction animation (~2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPaymentSuccess(orderRes as any);
    } catch (err) {
      console.error('Simulated checkout failed:', err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleContinueToExit = () => {
    const orderNo = completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000);
    resetBilling();
    // Start automated walk and trolley animation towards exit gate
    startExitAnimation(orderNo);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/[0.08]">
        
        {/* --- Top POS Header Bar --- */}
        <div className="bg-[#0B0F17] p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>MARTVERSE POS BILLING COUNTER #02</span>
                <span className="text-[10px] bg-blue-500/15 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  {phase === 'scanning' && (isPaused ? 'SCANNING PAUSED' : '1. SCANNING ITEMS...')}
                  {phase === 'review' && '2. BILL REVIEW'}
                  {phase === 'checkout_details' && '3. CUSTOMER DETAILS'}
                  {phase === 'processing' && 'PROCESSING...'}
                  {phase === 'success_popup' && 'PAID ✓'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>DMart High-Speed Conveyor Terminal</span>
                {isValidatingBackend && (
                  <span className="text-blue-400 text-[10px] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying DB...
                  </span>
                )}
              </p>
            </div>
          </div>
          {phase !== 'processing' && (
            <button
              onClick={handleCancelBilling}
              title="Cancel Billing (Preserves Trolley Items)"
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/[0.08]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          )}
        </div>

        {/* --- STEP 1: Interactive Barcode Scanning Animation --- */}
        {phase === 'scanning' && (
          <div className="p-6 flex flex-col space-y-4 overflow-y-auto">
            {/* Live Barcode Scanner Graphic */}
            <div className="relative w-full h-40 bg-[#080B11] rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col items-center justify-center">
              {/* Laser beam */}
              {!isPaused && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-rose-500 shadow-[0_0_20px_#ef4444] animate-pulse" />
              )}
              <Barcode className={`w-44 h-20 ${isPaused ? 'text-slate-700' : 'text-slate-500'}`} />
              
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
                <span className="text-[10px] font-mono text-slate-300 font-bold">
                  {isPaused ? 'CONVEYOR PAUSED' : 'CONVEYOR ACTIVE'}
                </span>
              </div>

              <div className="absolute bottom-2 text-[10px] font-mono text-blue-400">
                {isPaused ? 'PAUSED • CLICK RESUME TO CONTINUE' : 'LASER SCANNER READING BARCODE...'}
              </div>
            </div>

            {/* Running Total & Scanned Counter Bar */}
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Scanned Progress</span>
                <span className="text-sm font-bold text-white">
                  {currentIndex} of {totalToScan} Products Scanned
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Running Total</span>
                <span className="text-xl font-black text-blue-400 font-mono">
                  ₹{runningTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden border border-white/[0.06]">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${(currentIndex / Math.max(1, totalToScan)) * 100}%` }}
              />
            </div>

            {/* Scanning Controls: Pause / Resume / Cancel */}
            <div className="flex gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeScanning}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Resume Scanning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseScanning}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  Pause Scanning
                </button>
              )}

              <button
                type="button"
                onClick={handleCancelBilling}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08]"
              >
                <X className="w-4 h-4" />
                Cancel Billing
              </button>
            </div>

            {/* Recent Scanned Items Feed */}
            {scannedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scanned Items in Billing Queue:
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {scannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-white truncate block">
                            {item.productName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.brand} • ₹{item.price} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-slate-100 min-w-[50px] text-right">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeScannedItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 2: Final Bill Review --- */}
        {phase === 'review' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-[#080B11] rounded-2xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  Itemized Bill Breakdown ({scannedItems.length} Products)
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Backend Verified
                </span>
              </div>

              {/* Items List with Edit/Remove Controls */}
              <div className="divide-y divide-white/[0.06] max-h-56 overflow-y-auto pr-1 space-y-1">
                {scannedItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-white font-semibold truncate max-w-[240px]">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.brand} • ₹{item.price} each
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-slate-100 font-bold min-w-[55px] text-right">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeScannedItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DMart Savings Callout */}
            {activeDiscount > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>DMart Bachat Savings Applied:</span>
                </div>
                <span className="text-emerald-400 font-black text-sm">
                  - ₹{activeDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Bill Summary */}
            <div className="bg-[#080B11] rounded-2xl p-4 border border-white/[0.06] space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-white font-medium">₹{activeSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery / Handling:</span>
                <span className={activeDelivery === 0 ? 'text-emerald-400 font-bold' : 'text-white'}>
                  {activeDelivery === 0 ? 'FREE (Orders above ₹499)' : `₹${activeDelivery}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/[0.06]">
                <span>Final Order Total (Backend Verified):</span>
                <span className="text-blue-400 font-mono">₹{activeTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelBilling}
                className="px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all border border-white/[0.08]"
              >
                Cancel & Shop More
              </button>
              <button
                type="button"
                onClick={proceedToCheckoutDetails}
                disabled={scannedItems.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 transition-all btn-shine border border-blue-400/30"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Customer Details Form & Final Checkout --- */}
        {phase === 'checkout_details' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* DEMO BANNER */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  DEMO MODE — NO REAL MONEY WILL BE CHARGED
                </div>
                <div className="text-[11px] text-amber-200/80 mt-0.5">
                  Completely simulated payment for demonstration. No bank account, card, or UPI credentials required.
                </div>
              </div>
            </div>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Fulfilment Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfilmentType('DELIVERY')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  fulfilmentType === 'DELIVERY'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                }`}
              >
                <Truck className="w-4 h-4" /> Home Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfilmentType('STORE_PICKUP')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  fulfilmentType === 'STORE_PICKUP'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                }`}
              >
                <Store className="w-4 h-4" /> Store Self-Pickup
              </button>
            </div>

            {/* Customer Information Inputs */}
            <div className="bg-[#080B11] rounded-2xl p-4 border border-white/[0.06] space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Customer & Delivery Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Delivery Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House/Flat number, building, street address"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    PIN Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Total Payable Summary */}
            <div className="bg-[#080B11] p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Final Order Total (Backend Verified)</span>
                <div className="text-2xl font-black text-blue-400 font-mono">
                  ₹{activeTotalAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div>{scannedItems.length} Products in Trolley</div>
                <div className="text-emerald-400 font-medium">Demo Sandbox Payment</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={backToReview}
                className="px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold border border-white/[0.08]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={isButtonDisabled}
                className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-wider btn-shine border border-blue-400/30"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>PROCEED TO PAY</span>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: Dummy Payment Animation Popup (~2s processing) --- */}
        {phase === 'processing' && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                ₹
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">Processing your payment...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Validating order items, verifying stock in Supabase database, and generating your digital invoice.
              </p>
            </div>

            <div className="bg-blue-500/15 text-blue-300 text-xs font-bold px-4 py-2 rounded-full border border-blue-500/30">
              ⚡ DEMO MODE — NO REAL MONEY WILL BE CHARGED
            </div>
          </div>
        )}

        {/* --- STEP 5: Successful Payment Popup --- */}
        {phase === 'success_popup' && completedOrder && (
          <div className="p-7 flex flex-col items-center text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500 shadow-xl shadow-emerald-500/25 animate-bounce">
              <Check className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Payment Successful!</h3>
              <p className="text-xs text-emerald-400 font-semibold">
                This is a demo transaction. No real money was charged.
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="bg-[#080B11] border border-white/[0.06] rounded-2xl p-4 w-full text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <span className="text-slate-400">Order Number:</span>
                <span className="font-mono font-black text-blue-400 text-sm">
                  #{completedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-bold text-white">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purchased Products:</span>
                <span className="font-bold text-white">{completedOrder.purchasedProductCount} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Final Bill Amount:</span>
                <span className="font-black text-blue-400 text-sm">
                  ₹{completedOrder.finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Demo Payment Successful (SIMULATED_SUCCESS)
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/[0.06]">
                <span className="text-slate-400">Date and Time:</span>
                <span className="text-slate-300 font-mono text-[11px]">{completedOrder.dateTime}</span>
              </div>
            </div>

            {/* CONTINUE TO EXIT BUTTON */}
            <button
              type="button"
              onClick={handleContinueToExit}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 text-sm active:scale-95 transition-all uppercase tracking-wider btn-shine border border-blue-400/30"
            >
              <span>CONTINUE TO EXIT</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
