'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBillingStore } from '@/store/useBillingStore';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Barcode,
  CheckCircle2,
  X,
  CreditCard,
  Store,
  User,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Receipt,
  QrCode,
  Zap,
  Check,
  MapPin,
  Phone,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

export const BillingModal: React.FC = () => {
  const phase = useBillingStore((state) => state.phase);
  const scannedItems = useBillingStore((state) => state.scannedItems);
  const currentScanningItem = useBillingStore((state) => state.currentScanningItem);
  const currentUnitInfo = useBillingStore((state) => state.currentUnitInfo);
  const currentIndex = useBillingStore((state) => state.currentIndex);
  const totalToScan = useBillingStore((state) => state.totalToScan);
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const isValidatingBackend = useBillingStore((state) => state.isValidatingBackend);
  const backendQuote = useBillingStore((state) => state.backendQuote);
  const completedOrder = useBillingStore((state) => state.completedOrder);

  const skipToReview = useBillingStore((state) => state.skipToReview);
  const updateScannedItemQuantity = useBillingStore((state) => state.updateScannedItemQuantity);
  const removeScannedItem = useBillingStore((state) => state.removeScannedItem);
  const proceedToCheckoutDetails = useBillingStore((state) => state.proceedToCheckoutDetails);
  const backToReview = useBillingStore((state) => state.backToReview);
  const proceedToPaymentMethods = useBillingStore((state) => state.proceedToPaymentMethods);
  const backToCheckoutDetails = useBillingStore((state) => state.backToCheckoutDetails);
  const startProcessingPayment = useBillingStore((state) => state.startProcessingPayment);
  const setPaymentSuccess = useBillingStore((state) => state.setPaymentSuccess);
  const resetBilling = useBillingStore((state) => state.resetBilling);
  const revalidateCartWithBackend = useBillingStore((state) => state.revalidateCartWithBackend);

  const startExitAnimation = useMartStore((state) => state.startExitAnimation);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const authPhone = useAuthStore((state) => state.phone);

  // Customer Form state
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState(authPhone || '9876543210');
  const [fulfilmentType, setFulfilmentType] = useState<'DELIVERY' | 'STORE_PICKUP'>('STORE_PICKUP');
  const [addressLine1, setAddressLine1] = useState('Flat 402, Green Glen Heights, Outer Ring Rd');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('560103');
  const [formError, setFormError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  useEffect(() => {
    if (authPhone) {
      setCustomerPhone(authPhone);
    }
  }, [authPhone]);

  // Revalidate with backend when opening review, checkout details, or payment
  useEffect(() => {
    if (phase === 'review' || phase === 'checkout_details' || phase === 'payment_methods') {
      revalidateCartWithBackend(fulfilmentType);
    }
  }, [phase, fulfilmentType, revalidateCartWithBackend]);

  // Trigger celebration confetti on payment success
  useEffect(() => {
    if (phase === 'success_popup') {
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [phase]);

  if (phase === 'idle') return null;

  // Exact matching item calculations: In-store hypermarket checkout
  const clientSubtotal = scannedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const clientMrpTotal = scannedItems.reduce((acc, it) => acc + ((it.mrp || it.price) * it.quantity), 0);
  const clientDiscount = Math.max(0, clientMrpTotal - clientSubtotal);
  const clientDelivery = fulfilmentType === 'STORE_PICKUP' || clientSubtotal >= 499 ? 0 : 40;
  const clientGrandTotal = clientSubtotal + clientDelivery;

  const activeSubtotal = clientSubtotal;
  const activeDiscount = clientDiscount;
  const activeDelivery = clientDelivery;
  const activeTotalAmount = clientGrandTotal;
  const gstInclusiveAmount = (activeSubtotal * 0.05).toFixed(2);

  // When tapping 'Back to Store': place customer outside the queue box in the billing aisle without re-triggering billing
  const handleCancelBilling = () => {
    resetBilling();
    setCameraMode('third_person');
    martRuntime.billingCooldownUntil = Date.now() + 5000;
    const currentX = martRuntime.playerPos[0];
    let safeX = -1.9;
    if (currentX < -3.5) safeX = -5.7;
    else if (currentX > 0.0) safeX = 1.9;
    setPlayerPos([safeX, 1.5, 13.8], 0);
  };

  const handleValidateDetails = () => {
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (fulfilmentType === 'DELIVERY') {
      if (!addressLine1.trim()) {
        setFormError('Delivery street address is required for home delivery.');
        return;
      }
      if (!city.trim() || !pinCode.trim()) {
        setFormError('City and 6-digit Pincode are required.');
        return;
      }
    }
    setFormError(null);
    proceedToPaymentMethods();
  };

  const handleProceedToPay = async () => {
    setFormError(null);
    setIsButtonDisabled(true);
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

      // Smooth simulated transaction processing (~1.5s)
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
    startExitAnimation(orderNo);
  };

  // ==============================================================
  // STEP 1: SCANNING PHASE — Minimalist Floating Bar Below Navbar (Right Side)
  // Best look below top executive navbar on right side: item details & Instant Bill
  // ==============================================================
  if (phase === 'scanning') {
    return (
      <div className="fixed top-20 sm:top-22 right-3 sm:right-6 z-50 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 max-w-[calc(100vw-24px)] w-auto">
        <div className="bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl px-3.5 sm:px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-slate-700/80 flex items-center gap-2.5 sm:gap-3 select-none">
          {/* Scanner Beacon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-wider text-slate-300 uppercase font-mono leading-none">
                POS SCANNER 02
              </span>
              <span className="text-[9px] text-emerald-400 font-bold leading-tight mt-0.5">
                Gliding Bench
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 flex-shrink-0" />

          {/* Currently Scanning Item Details */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-[190px] sm:max-w-[250px]">
            <div className="w-8.5 h-8.5 rounded-lg bg-white/10 border border-white/20 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
              {currentScanningItem?.productImage ? (
                <img
                  src={currentScanningItem.productImage}
                  alt={currentScanningItem.productName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/products/fallback.svg';
                  }}
                />
              ) : (
                <span className="text-sm">🛍️</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                <span className="truncate">{currentScanningItem ? currentScanningItem.productName : 'Transferring item from trolley...'}</span>
                {currentUnitInfo && currentUnitInfo.totalUnits > 1 && (
                  <span className="text-[9px] font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/30 whitespace-nowrap flex-shrink-0">
                    Unit {currentUnitInfo.unitIndex}/{currentUnitInfo.totalUnits}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="text-white font-bold">{currentScanningItem ? `₹${currentScanningItem.price} each` : ''}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold truncate">
                  {totalToScan > 0 ? `Scanned ${Math.min(totalToScan, currentIndex)} of ${totalToScan} units` : 'Scanning...'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 flex-shrink-0" />

          {/* Running Total & Instant Bill Action */}
          <div className="text-right flex-shrink-0">
            <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Amount</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-tight">
              ₹{runningTotal.toFixed(2)}
            </span>
          </div>

          {/* Instant Bill Action Button */}
          <button
            type="button"
            onClick={skipToReview}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            title="Instant Bill: Skip conveyor scan & view bill [Space]"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span className="whitespace-nowrap">Instant Bill</span>
          </button>

          {/* Return / Cancel */}
          <button
            type="button"
            onClick={handleCancelBilling}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
            title="Return to supermarket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================
  // DIRECT OPEN ONE PAGE — Best Look White Background Checkout
  // Unified single-page view: item details, customer details, payment & exact calculated money
  // ==============================================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 overflow-y-auto select-none animate-in fade-in duration-200">
      {/* --- Top Clean Executive Header --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Store className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-900">
                  MARTVERSE POS BILLING
                </h1>
                <span className="text-[10px] bg-slate-900 text-cyan-400 font-bold px-2 py-0.5 rounded-full font-mono">
                  LANE 02
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Official In-Store Express Checkout & Invoice
              </p>
            </div>
          </div>

          {phase !== 'processing' && phase !== 'success_popup' && (
            <button
              type="button"
              onClick={handleCancelBilling}
              title="Return to Supermarket Aisle"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all border border-slate-200 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Back to Store</span>
            </button>
          )}
        </div>
      </header>

      {/* --- STEP 4: PROCESSING PAYMENT --- */}
      {phase === 'processing' && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center shadow-md" />
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">Authorizing Payment & Unlocking Exits...</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Generating your official digital tax invoice and clearing RFID security barriers.
            </p>
          </div>
        </div>
      )}

      {/* --- STEP 5: OFFICIAL TAX BILL & EXIT TURNSTILES UNLOCKED --- */}
      {phase === 'success_popup' && (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-5">
          {/* Unlocked Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm flex-shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-black text-emerald-950 text-base sm:text-lg">
                Payment Verified • Supermarket Exit Turnstiles Unlocked!
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your RFID shopping trolley barcode is cleared. You can now walk freely through the security exit turnstiles.
              </p>
            </div>
          </div>

          {/* Official Tax Invoice Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 font-mono text-xs">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">TAX INVOICE NUMBER</span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">PAID IN FULL</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  ₹{(completedOrder?.finalAmount || activeTotalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 text-xs">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-slate-900">{completedOrder?.customerName || customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-bold text-slate-900">+91 {completedOrder?.customerPhone || customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-900">{selectedPaymentMethod} (SUCCESS)</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfilment:</span>
                <span className="font-bold text-slate-900">
                  {fulfilmentType === 'STORE_PICKUP' ? 'Store Self-Pickup (Counter 02)' : `Home Delivery: ${addressLine1}, ${city}`}
                </span>
              </div>
            </div>

            {/* Scanned Items Summary in Receipt */}
            <div className="pt-3 border-t border-slate-100 divide-y divide-slate-100">
              {scannedItems.map((item) => (
                <div key={item.id} className="py-2 flex justify-between text-[11px]">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exit Guide Button */}
          <button
            type="button"
            onClick={handleContinueToExit}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-slate-900/25 active:scale-98 cursor-pointer uppercase tracking-wide transition-all"
          >
            <span>Walk to Supermarket Exit Gate</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* --- UNIFIED DIRECT OPEN ONE PAGE: DETAILS OF ITEMS & EXACT CALCULATED MONEY --- */}
      {phase !== 'processing' && phase !== 'success_popup' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* ============================================================== */}
            {/* LEFT COLUMN: Scanned Items, Customer Details & Payment Methods */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 space-y-6">

              {/* CARD 1: Scanned Items Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Barcode className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 text-sm sm:text-base">
                        Scanned Trolley Items
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Exact physical items scanned from your shopping trolley
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                    {scannedItems.length} Products
                  </span>
                </div>

                {/* Items List Table */}
                <div className="divide-y divide-slate-100">
                  {scannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      {/* Product Image & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src={item.productImage || '/products/fallback.svg'}
                            alt={item.productName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/fallback.svg';
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ₹{item.price} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg text-slate-600 hover:text-black hover:bg-white flex items-center justify-center cursor-pointer transition-all"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-black text-slate-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg text-slate-600 hover:text-black hover:bg-white flex items-center justify-center cursor-pointer transition-all"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-16">
                          <span className="font-black text-slate-900 font-mono text-sm">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeScannedItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: Customer Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-sm sm:text-base">
                      Customer Details
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Enter contact details for in-store checkout & invoice
                    </p>
                  </div>
                </div>

                {/* Name & Phone Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number</label>
                    <div className="flex items-center bg-slate-50 border border-slate-300 focus-within:bg-white focus-within:border-blue-600 rounded-xl px-3 py-2.5 transition-all">
                      <span className="text-xs font-bold text-slate-400 mr-2">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full bg-transparent text-xs text-slate-900 font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address fields if Delivery selected */}
                {fulfilmentType === 'DELIVERY' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Street Address</label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Flat / House / Street Name"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Error Banner */}
                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* CARD 3: Payment Method Selection */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-sm sm:text-base">
                      Payment Method
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Select your preferred in-store or online payment channel
                    </p>
                  </div>
                </div>

                {/* Payment Channel Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                    { id: 'CASH', label: 'Cash Counter', icon: Receipt },
                    { id: 'NETBANKING', label: 'NetBanking', icon: Building2 },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = selectedPaymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(pm.id as any)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Method Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  {selectedPaymentMethod === 'UPI' && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-700 font-bold block">UPI ID / VPA</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 block">Instant authorization via Google Pay, PhonePe, Paytm, or BHIM</span>
                    </div>
                  )}

                  {selectedPaymentMethod === 'CARD' && (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-slate-700 font-bold block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-700 font-bold block mb-1">Expiry MM/YY</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-700 font-bold block mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'CASH' && (
                    <div className="text-xs text-slate-700 flex items-center gap-3">
                      <Receipt className="w-7 h-7 text-amber-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-900 block font-bold">Cash Payment at Counter #02</strong>
                        <span>Hand over exact cash of ₹{activeTotalAmount.toLocaleString('en-IN')} to the cashier.</span>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'NETBANKING' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-700 font-bold block">Select Bank</label>
                      <select className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: Official Bill Calculation Box (Sticky on Desktop) */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                      Bill Calculation & Summary
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Total
                  </span>
                </div>

                {/* Calculation Rows */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal ({scannedItems.length} products):</span>
                    <span className="text-slate-900 font-bold font-mono">
                      ₹{activeSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Total Savings on MRP:</span>
                      <span className="font-mono">- ₹{activeDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery / Handling:</span>
                    <span className="font-bold text-emerald-700">
                      {activeDelivery === 0 ? 'FREE (Store Pickup)' : `₹${activeDelivery}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>GST Tax Breakdown (5% Included in MRP):</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      ₹{gstInclusiveAmount} (Included)
                    </span>
                  </div>

                  {/* Net Total Payable */}
                  <div className="pt-3 border-t-2 border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">TOTAL PAYABLE AMOUNT</span>
                      <span className="text-[10px] text-slate-400">Official hypermarket invoice rate</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                      ₹{activeTotalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Primary Confirm & Pay Action */}
                <button
                  type="button"
                  onClick={handleProceedToPay}
                  disabled={isButtonDisabled || scannedItems.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>CONFIRM & PAY ₹{activeTotalAmount.toLocaleString('en-IN')}</span>
                </button>

                {/* Secondary Back Action */}
                <button
                  type="button"
                  onClick={handleCancelBilling}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Return to 3D Supermarket
                </button>

                {/* Security Trust Footnote */}
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>256-bit Bank Grade Encrypted Transaction</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Instant RFID turnstile clearance upon payment</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  );
};
