'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBillingStore } from '@/store/useBillingStore';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Barcode,
  CheckCircle2,
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
  Receipt,
  QrCode,
  Zap,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

export const BillingModal: React.FC = () => {
  const phase = useBillingStore((state) => state.phase);
  const isPaused = useBillingStore((state) => state.isPaused);
  const scannedItems = useBillingStore((state) => state.scannedItems);
  const currentScanningItem = useBillingStore((state) => state.currentScanningItem);
  const scanStage = useBillingStore((state) => state.scanStage);
  const currentIndex = useBillingStore((state) => state.currentIndex);
  const totalToScan = useBillingStore((state) => state.totalToScan);
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const isValidatingBackend = useBillingStore((state) => state.isValidatingBackend);
  const backendQuote = useBillingStore((state) => state.backendQuote);
  const completedOrder = useBillingStore((state) => state.completedOrder);

  const pauseScanning = useBillingStore((state) => state.pauseScanning);
  const resumeScanning = useBillingStore((state) => state.resumeScanning);
  const skipToReview = useBillingStore((state) => state.skipToReview);
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');

  const receiptScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authPhone) {
      setCustomerPhone(authPhone);
    }
  }, [authPhone]);

  // Auto-scroll the printed receipt to the latest line as items scan
  useEffect(() => {
    if (receiptScrollRef.current) {
      receiptScrollRef.current.scrollTop = receiptScrollRef.current.scrollHeight;
    }
  }, [scannedItems.length, phase]);

  // Revalidate with backend when opening review or checkout details
  useEffect(() => {
    if (phase === 'review' || phase === 'checkout_details') {
      revalidateCartWithBackend(fulfilmentType);
    }
  }, [phase, fulfilmentType, revalidateCartWithBackend]);

  // Trigger celebration confetti on payment success
  useEffect(() => {
    if (phase === 'success_popup') {
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [phase]);

  if (phase === 'idle') return null;

  // Exact matching item calculations: In-store hypermarket checkout has exact subtotal pricing
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

      // Smooth simulated transaction processing (~1.6s)
      await new Promise((resolve) => setTimeout(resolve, 1600));
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
  // --- REAL-TIME 3D CONVEYOR HUD (Floating, Unobstructed 3D View) ---
  // ==============================================================
  if (phase === 'scanning') {
    return (
      <div className="fixed top-5 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] pointer-events-auto animate-in slide-in-from-top-4 duration-300">
        <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-slate-200/90 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Barcode className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-xs tracking-tight text-slate-900">
                    EXPRESS 3D POS SCANNER
                  </h3>
                  <span className="text-[9px] bg-slate-900 text-slate-200 font-mono font-bold px-1.5 py-0.5 rounded">
                    LANE 02
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-ping'}`} />
                  <span className="text-[10px] font-semibold text-slate-500">
                    {isPaused ? 'Conveyor Paused' : 'Live 3D Conveyor Gliding'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCancelBilling}
              title="Return to Supermarket"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Currently Scanning Item Card */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {currentScanningItem?.productImage ? (
                  <img
                    src={currentScanningItem.productImage}
                    alt={currentScanningItem.productName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/products/fallback.svg';
                    }}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-xl">🛍️</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  Conveyor Bench Scan
                </div>
                <div className="text-xs font-black text-slate-900 truncate">
                  {currentScanningItem ? currentScanningItem.productName : 'Reading barcode...'}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {currentScanningItem ? `₹${currentScanningItem.price} each` : ''}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {Math.min(totalToScan, currentIndex + 1)} / {totalToScan}
              </span>
            </div>
          </div>

          {/* Running Cumulative Total Display ("after scann add amount") */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                TOTAL AMOUNT
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Exact In-Store Subtotal
              </span>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
              <span>₹</span>
              <span>{runningTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons: Instant Scan All + Pause */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={skipToReview}
              className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md active:scale-98 transition-all cursor-pointer"
              title="Instantly scan all items and view bill"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Instant Scan All [Space]</span>
            </button>

            {isPaused ? (
              <button
                type="button"
                onClick={resumeScanning}
                className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                title="Resume Conveyor"
              >
                <Play className="w-4 h-4 fill-slate-800" />
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseScanning}
                className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                title="Pause Conveyor"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      {/* Pristine Executive White Box Modal with Perfect Alignment */}
      <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 animate-in zoom-in-95 duration-200">
        
        {/* --- Top Header Bar --- */}
        <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Barcode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base tracking-tight text-white">
                  MARTVERSE POS BILLING COUNTER
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
                  LANE 02
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Express Automated Scanning</span>
                {isValidatingBackend && (
                  <span className="text-blue-400 text-[10px] flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying DB...
                  </span>
                )}
              </p>
            </div>
          </div>

          {phase !== 'processing' && (
            <button
              onClick={handleCancelBilling}
              title="Return to Supermarket"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* --- STEP 2: Pure White Box Bill Review with Perfect Alignment --- */}
        {/* ============================================================== */}
        {phase === 'review' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Header Success Confirmation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                    All Items Scanned & Verified
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review your bill below. Exact in-store supermarket pricing with zero extra fees.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                {scannedItems.length} ITEMS
              </span>
            </div>

            {/* Bill Line Items Table (Clean, Perfect Alignment) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {scannedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/fallback.svg';
                          }}
                          className="w-full h-full object-contain p-0.5 bg-white"
                        />
                      ) : (
                        <span className="text-sm">🛍️</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">₹{item.price} each</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
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

            {/* Clean White Box Bill Breakdown (Perfect Alignment & Formatting) */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({scannedItems.length} items):</span>
                <span className="font-bold text-slate-900 font-mono">₹{activeSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {activeDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Store Discount Savings:</span>
                  <span className="font-mono">- ₹{activeDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Store Carrying Out / Pickup:</span>
                <span className="font-bold text-emerald-700">FREE (₹0)</span>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 block">TOTAL PAYABLE AMOUNT</span>
                  <span className="text-[10px] text-slate-500">Exact in-store price • Inclusive of all GST</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  ₹{activeTotalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={isButtonDisabled || scannedItems.length === 0}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>PAY ₹{activeTotalAmount.toLocaleString('en-IN')} INSTANTLY</span>
              </button>

              <button
                type="button"
                onClick={proceedToCheckoutDetails}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Truck className="w-4 h-4 text-slate-600" />
                <span>Home Delivery / Tax Invoice</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 3: Customer Details Form --- */}
        {/* ============================================================== */}
        {phase === 'checkout_details' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfilmentType('STORE_PICKUP')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  fulfilmentType === 'STORE_PICKUP'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4" /> Store Self-Pickup (Free)
              </button>
              <button
                type="button"
                onClick={() => setFulfilmentType('DELIVERY')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  fulfilmentType === 'DELIVERY'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4" /> Home Delivery
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {fulfilmentType === 'DELIVERY' && (
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                Select Payment Method:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI' as const, label: 'Instant UPI', icon: QrCode },
                  { id: 'CARD' as const, label: 'Card Tap', icon: CreditCard },
                  { id: 'CASH' as const, label: 'POS Cash', icon: Receipt },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(pm.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentMethod === pm.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <pm.icon className="w-4 h-4" />
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={backToReview}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={isButtonDisabled}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-98 cursor-pointer uppercase tracking-wide"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>CONFIRM & PAY ₹{activeTotalAmount.toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 4: Processing State --- */}
        {/* ============================================================== */}
        {phase === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-900 border-t-transparent animate-spin flex items-center justify-center" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Authorizing Payment...</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Generating digital tax invoice and unlocking supermarket exit sensor turnstiles.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* --- STEP 5: Official Tax Bill & Exit Unlocked --- */}
        {/* ============================================================== */}
        {phase === 'success_popup' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Unlocked Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-black text-emerald-950 text-sm">Payment Verified • Exit Gates Unlocked!</h3>
                <p className="text-xs text-emerald-800">
                  Your RFID shopping trolley barcode is cleared. You can now walk freely through the security exit turnstiles.
                </p>
              </div>
            </div>

            {/* Official Tax Invoice Card (Clean White Box) */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">TAX INVOICE NUMBER</span>
                  <span className="text-sm font-black text-slate-900">
                    {completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">PAID AMOUNT</span>
                  <span className="text-lg font-black text-slate-900">
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
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-emerald-700">SIMULATED SUCCESS (PAID IN FULL)</span>
                </div>
              </div>
            </div>

            {/* Exit Guide Button */}
            <button
              type="button"
              onClick={handleContinueToExit}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-98 cursor-pointer uppercase tracking-wide"
            >
              <span>Walk to Supermarket Exit Gate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
