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
  const showToast = useMartStore((state) => state.showToast);
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
  const clientSubtotal = scannedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const clientMrpTotal = scannedItems.reduce((acc, it) => acc + it.mrp * it.quantity, 0);
  const clientDiscount = Math.max(0, clientMrpTotal - clientSubtotal);
  const clientDelivery = fulfilmentType === 'STORE_PICKUP' || clientSubtotal >= 499 ? 0 : 40;
  const clientGrandTotal = clientSubtotal + clientDelivery;

  const activeSubtotal = backendQuote?.subtotal ?? clientSubtotal;
  const activeDiscount = backendQuote?.discountAmount ?? clientDiscount;
  const activeDelivery = fulfilmentType === 'STORE_PICKUP' ? 0 : (backendQuote?.deliveryCharge ?? clientDelivery);
  const activeTotalAmount = backendQuote ? (backendQuote.totalAmount || (backendQuote.subtotal + activeDelivery)) : clientGrandTotal;
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
    showToast('Returned to Store Floor', 'Trolley is parked safely outside POS billing lane', 'info');
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
  // STEP 1: SCANNING PHASE — Minimalist Floating Top Pill Bar
  // User can watch 3D items drop from trolley to bench & scanner unobstructed!
  // ==============================================================
  if (phase === 'scanning') {
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 w-full max-w-xl px-4">
        <div className="bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/80 flex items-center justify-between gap-3">
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

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Currently Scanning Item Details */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
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
                <span>{currentScanningItem ? currentScanningItem.productName : 'Transferring item from trolley...'}</span>
                {currentUnitInfo && currentUnitInfo.totalUnits > 1 && (
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/30 whitespace-nowrap">
                    Unit {currentUnitInfo.unitIndex}/{currentUnitInfo.totalUnits}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="text-white font-bold">{currentScanningItem ? `₹${currentScanningItem.price} each` : ''}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">
                  {totalToScan > 0 ? `Scanned ${Math.min(totalToScan, currentIndex)} of ${totalToScan} units` : 'Scanning...'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Running Total & Skip Action */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Amount</span>
              <span className="text-xs font-black text-emerald-400 font-mono leading-tight">
                ₹{runningTotal.toFixed(2)}
              </span>
            </div>

            {/* Skip Scanning Button ("show there only option like skip") */}
            <button
              type="button"
              onClick={skipToReview}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              title="Skip 3D conveyor scan & view bill [Space]"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Skip</span>
            </button>

            {/* Return / Cancel */}
            <button
              type="button"
              onClick={handleCancelBilling}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to supermarket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MODAL WRAPPER FOR REVIEW, DETAILS, PAYMENT & SUCCESS
  // ==============================================================
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 animate-in zoom-in-95 duration-200">
        
        {/* --- Top Modal Header Strip --- */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <Barcode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base tracking-tight text-white">
                  MARTVERSE POS BILLING COUNTER
                </h2>
                <span className="text-[10px] bg-slate-800 text-cyan-400 font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
                  LANE 02
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Express Automated Checkout</span>
                {isValidatingBackend && (
                  <span className="text-cyan-400 text-[10px] flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying Price DB...
                  </span>
                )}
              </p>
            </div>
          </div>

          {phase !== 'processing' && phase !== 'success_popup' && (
            <button
              onClick={handleCancelBilling}
              title="Return to Supermarket Aisle"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          )}
        </div>

        {/* --- Step Progress Bar --- */}
        {phase !== 'processing' && phase !== 'success_popup' && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                phase === 'review' ? 'bg-blue-600 text-white font-black' : 'bg-emerald-600 text-white'
              }`}>
                {phase === 'review' ? '1' : <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span className={phase === 'review' ? 'text-slate-900 font-black' : 'text-slate-500'}>
                1. Bill Review
              </span>
            </div>

            <span className="text-slate-300">──</span>

            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                phase === 'checkout_details' ? 'bg-blue-600 text-white font-black' : phase === 'payment_methods' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {phase === 'payment_methods' ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
              </span>
              <span className={phase === 'checkout_details' ? 'text-slate-900 font-black' : 'text-slate-500'}>
                2. User Details
              </span>
            </div>

            <span className="text-slate-300">──</span>

            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                phase === 'payment_methods' ? 'bg-blue-600 text-white font-black' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span className={phase === 'payment_methods' ? 'text-slate-900 font-black' : 'text-slate-500'}>
                3. Payment
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 1: BILL REVIEW --- */}
        {/* Shows items, calculated cost, tax, delivery charges, savings, and checkout button */}
        {/* ============================================================== */}
        {phase === 'review' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Header Badge */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                    All Items Scanned from Trolley
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Exact in-store prices with full GST breakdown. Verify your items below.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200">
                {scannedItems.length} ITEMS
              </span>
            </div>

            {/* Bill Line Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto shadow-inner bg-slate-50/40">
              {scannedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white hover:bg-slate-50/90 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={item.productImage || '/products/fallback.svg'}
                        alt={item.productName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/fallback.svg';
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:text-black hover:bg-white flex items-center justify-center cursor-pointer transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-black text-slate-900 text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:text-black hover:bg-white flex items-center justify-center cursor-pointer transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-16">
                      <span className="font-black text-slate-900 font-mono text-sm">₹{item.subtotal}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeScannedItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Perfect Calculated Financial Cost Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({scannedItems.length} products):</span>
                <span className="font-bold text-slate-900 font-mono">₹{activeSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {activeDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Store Discount Savings:</span>
                  <span className="font-mono">- ₹{activeDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery / Carrying Out:</span>
                <span className="font-bold text-emerald-700">FREE (₹0.00 • Store Pickup)</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>GST Tax Breakdown (5% Included in MRP):</span>
                <span className="font-mono text-slate-700 font-semibold">₹{gstInclusiveAmount} (Included)</span>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 block">TOTAL PAYABLE AMOUNT</span>
                  <span className="text-[10px] text-slate-500">Official hypermarket invoice rate</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  ₹{activeTotalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Action Buttons: Checkout + Back to Store */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleCancelBilling}
                className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              <button
                type="button"
                onClick={proceedToCheckoutDetails}
                disabled={scannedItems.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 2: USER DETAILS & SIDE ITEMS ORDER SUMMARY --- */}
        {/* "when i tap checkout it ask details of the user show items side and proceed to pay" */}
        {/* ============================================================== */}
        {phase === 'checkout_details' && (
          <div className="p-5 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Customer & Delivery Details Form (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    Customer & Fulfilment Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide your contact and delivery preference.
                  </p>
                </div>

                {/* Fulfilment Selector */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFulfilmentType('STORE_PICKUP')}
                    className={`py-3 px-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      fulfilmentType === 'STORE_PICKUP'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>Store Self-Pickup</span>
                    </div>
                    <span className={`text-[10px] ${fulfilmentType === 'STORE_PICKUP' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      FREE • Counter 02
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfilmentType('DELIVERY')}
                    className={`py-3 px-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      fulfilmentType === 'DELIVERY'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Home Delivery</span>
                    </div>
                    <span className={`text-[10px] ${fulfilmentType === 'DELIVERY' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {clientSubtotal >= 499 ? 'FREE Delivery' : '+ ₹40 Express'}
                    </span>
                  </button>
                </div>

                {/* Form Fields */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1 mb-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Full Name</span> <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1 mb-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mobile Number</span> <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {fulfilmentType === 'DELIVERY' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Street Address</span> <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="Flat/House No, Building, Street Area"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-600 font-bold block mb-1">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-600 font-bold block mb-1">State</label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-600 font-bold block mb-1">Pincode</label>
                          <input
                            type="text"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={backToReview}
                    className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleValidateDetails}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>PROCEED TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: "show items side" Order Summary (5 cols) */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-black text-xs uppercase tracking-wide text-slate-900">
                      Order Summary
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {scannedItems.length} Items
                    </span>
                  </div>

                  {/* Scrollable Items Side List */}
                  <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto my-3 pr-1">
                    {scannedItems.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={item.productImage || '/products/fallback.svg'}
                              alt={item.productName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/products/fallback.svg';
                              }}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 truncate block text-[11px]">
                              {item.productName}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 font-mono text-xs flex-shrink-0">
                          ₹{item.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compact Financials */}
                <div className="space-y-1.5 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">₹{activeSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Savings:</span>
                      <span className="font-mono">- ₹{activeDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery:</span>
                    <span className="font-bold text-emerald-700">
                      {activeDelivery === 0 ? 'FREE' : `₹${activeDelivery}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-black">
                    <span className="text-slate-900 text-xs">Total Payable:</span>
                    <span className="text-lg font-mono text-slate-900">₹{activeTotalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 3: PAYMENT METHODS & FINAL CONFIRMATION --- */}
        {/* "after details enter show payment methods perfect understand" */}
        {/* ============================================================== */}
        {phase === 'payment_methods' && (
          <div className="p-5 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Payment Method Selectors (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    100% Secure Simulated Transaction • Instant POS Authorization
                  </p>
                </div>

                {/* 4 Interactive Payment Options */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'UPI' as const, label: 'Instant UPI', desc: 'GPay, PhonePe, Paytm', icon: QrCode },
                    { id: 'CARD' as const, label: 'Card Tap / EMV', desc: 'Debit / Credit Cards', icon: CreditCard },
                    { id: 'CASH' as const, label: 'Pay at Counter', desc: 'Cash at Counter 02', icon: Receipt },
                    { id: 'NETBANKING' as const, label: 'Net Banking', desc: 'All Major Banks', icon: Building2 },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedPaymentMethod === pm.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <pm.icon className={`w-5 h-5 ${selectedPaymentMethod === pm.id ? 'text-blue-400' : 'text-slate-600'}`} />
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === pm.id ? 'border-blue-400 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {selectedPaymentMethod === pm.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="font-black text-xs">{pm.label}</span>
                      <span className={`text-[10px] mt-0.5 ${selectedPaymentMethod === pm.id ? 'text-slate-400' : 'text-slate-500'}`}>
                        {pm.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Specific payment details view */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
                  {selectedPaymentMethod === 'UPI' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                          {/* Simulated QR Pattern */}
                          <div className="w-full h-full bg-white rounded flex items-center justify-center p-1 font-mono text-[9px] text-center font-black">
                            [UPI QR]
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Live Dynamic QR
                          </span>
                          <div className="font-bold text-slate-900 text-xs">
                            Scan with GPay, PhonePe, Paytm, or BHIM
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            VPA: martverse.pos02@upi
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-bold block mb-1">Or Enter Virtual Payment Address (UPI ID):</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'CARD' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-600 font-bold block mb-1">Card Number:</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-600 font-bold block mb-1">Expiry MM/YY:</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600 font-bold block mb-1">CVV:</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'CASH' && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-amber-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-900 block">Cash Payment at Counter #02</strong>
                        Please hand over exact cash of ₹{activeTotalAmount.toLocaleString('en-IN')} to the cashier upon exiting the lane.
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'NETBANKING' && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-600 font-bold block">Select Bank:</label>
                      <select className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 text-xs">
                        <option>HDFC Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={backToCheckoutDetails}
                    className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToPay}
                    disabled={isButtonDisabled}
                    className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>CONFIRM & PAY ₹{activeTotalAmount.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Recipient & Order Review (5 cols) */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-black text-xs uppercase tracking-wide text-slate-900">
                      Payment Verification
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      100% Encrypted
                    </span>
                  </div>

                  {/* Customer Information Preview */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Customer Info</div>
                    <div className="font-bold text-slate-900">{customerName}</div>
                    <div className="text-[11px] text-slate-600">+91 {customerPhone}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {fulfilmentType === 'DELIVERY' ? addressLine1 : 'Store Self-Pickup • Counter 02'}
                    </div>
                  </div>

                  {/* Items count preview */}
                  <div className="text-xs text-slate-600 flex justify-between py-1">
                    <span>Purchased Items:</span>
                    <span className="font-bold text-slate-900 font-mono">{scannedItems.length} Products</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">FINAL NET PAYABLE</span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{activeTotalAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                    Inclusive of all GST & taxes
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 4: PROCESSING PAYMENT --- */}
        {/* ============================================================== */}
        {phase === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center shadow-md" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Authorizing Payment & Unlocking Exits...</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Generating your official digital tax invoice and unlocking supermarket turnstile gates.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 5: OFFICIAL TAX BILL & EXIT TURNSTILES UNLOCKED --- */}
        {/* ============================================================== */}
        {phase === 'success_popup' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Unlocked Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-black text-emerald-950 text-sm sm:text-base">
                  Payment Verified • Supermarket Exit Turnstiles Unlocked!
                </h3>
                <p className="text-xs text-emerald-800">
                  Your RFID shopping trolley barcode is cleared. You can now walk freely through the security exit turnstiles.
                </p>
              </div>
            </div>

            {/* Official Tax Invoice Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">TAX INVOICE NUMBER</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">PAID IN FULL</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-700">
                    ₹{(completedOrder?.finalAmount || activeTotalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-700 text-[11px]">
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
                  <span className="font-bold text-slate-900">{selectedPaymentMethod} (SIMULATED_SUCCESS)</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfilment:</span>
                  <span className="font-bold text-slate-900">
                    {fulfilmentType === 'STORE_PICKUP' ? 'Store Self-Pickup (Counter 02)' : `Home Delivery: ${addressLine1}, ${city}`}
                  </span>
                </div>
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
      </div>
    </div>
  );
};
