'use client';

import React, { useState, useEffect } from 'react';
import { useBillingStore } from '@/store/useBillingStore';
import { useMartStore, martRuntime } from '@/store/useMartStore';
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
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Receipt,
  QrCode,
  Zap,
  Check,
  MapPin,
  Home,
  Building,
  Navigation,
  Banknote,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

// --- SVGs for Payment Providers ---
const GooglePayIcon: React.FC = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path
      d="M23.04 12.261c0-.82-.073-1.609-.21-2.361H12v4.51h6.19c-.267 1.44-1.076 2.659-2.296 3.476v2.89h3.72c2.176-2.003 3.426-4.952 3.426-8.515z"
      fill="#4285F4"
    />
    <path
      d="M12 23.5c3.106 0 5.71-1.03 7.613-2.79l-3.72-2.89c-1.03.69-2.348 1.1-3.893 1.1-2.994 0-5.529-2.022-6.433-4.74H1.716v2.98C3.606 20.94 8.01 23.5 12 23.5z"
      fill="#34A853"
    />
    <path
      d="M5.567 14.18c-.23-.69-.362-1.43-.362-2.18s.132-1.49.362-2.18V6.84H1.716C.942 8.38.5 10.14.5 12s.442 3.62 1.216 5.16l3.851-2.98z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.98c1.688 0 3.204.58 4.397 1.719l3.298-3.299C17.705 1.58 15.101.5 12 .5 8.01.5 3.606 3.06 1.716 6.84l3.851 2.98C6.471 7.102 9.006 4.98 12 4.98z"
      fill="#EA4335"
    />
  </svg>
);

const PhonePeIcon: React.FC = () => (
  <div className="w-6 h-6 rounded-lg bg-[#5f259f] flex items-center justify-center text-white font-black text-xs shadow-xs flex-shrink-0 select-none">
    <span>पे</span>
  </div>
);

const PaytmIcon: React.FC = () => (
  <div className="w-7 h-5 rounded-md bg-[#002e6e] border border-[#00b9f5]/40 flex items-center justify-center text-[#00b9f5] font-black text-[9px] tracking-tight shadow-xs flex-shrink-0 select-none px-1">
    <span>paytm</span>
  </div>
);

// --- BigBasket Style Saved Address Interface ---
interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  houseNo: string; // House / Flat / Building No. & Name
  area: string; // Street / Locality / Area
  landmark: string; // Landmark
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    type: 'HOME',
    houseNo: 'Flat 402, Green Glen Heights, Tower B',
    area: 'Outer Ring Road, Bellandur',
    landmark: 'Near EcoSpace Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560103',
    isDefault: true,
  },
  {
    id: 'addr-2',
    name: 'Rahul Sharma',
    phone: '9876543210',
    type: 'WORK',
    houseNo: 'Building 4B, 3rd Floor, Global Tech Park',
    area: 'Sarjapur Main Road',
    landmark: 'Opposite Wipro Gate 02',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560035',
    isDefault: false,
  },
];

export const BillingModal: React.FC = () => {
  const phase = useBillingStore((state) => state.phase);
  const scannedItems = useBillingStore((state) => state.scannedItems);
  const currentScanningItem = useBillingStore((state) => state.currentScanningItem);
  const currentUnitInfo = useBillingStore((state) => state.currentUnitInfo);
  const currentIndex = useBillingStore((state) => state.currentIndex);
  const totalToScan = useBillingStore((state) => state.totalToScan);
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const completedOrder = useBillingStore((state) => state.completedOrder);

  const skipToReview = useBillingStore((state) => state.skipToReview);
  const updateScannedItemQuantity = useBillingStore((state) => state.updateScannedItemQuantity);
  const removeScannedItem = useBillingStore((state) => state.removeScannedItem);
  const startProcessingPayment = useBillingStore((state) => state.startProcessingPayment);
  const setPaymentSuccess = useBillingStore((state) => state.setPaymentSuccess);
  const resetBilling = useBillingStore((state) => state.resetBilling);
  const revalidateCartWithBackend = useBillingStore((state) => state.revalidateCartWithBackend);

  const startExitAnimation = useMartStore((state) => state.startExitAnimation);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const authPhone = useAuthStore((state) => state.phone);

  // Customer Contact State
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState(authPhone || '9876543210');

  // Address Management State (BigBasket style)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    houseNo: '',
    area: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '',
    setAsDefault: false,
  });

  // Payment State: UPI (PhonePe, Paytm, GPay), Card (Details), Cash on Delivery (+₹20)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'PAYTM' | 'GPAY' | 'CUSTOM'>('PHONEPE');
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 8921 7382 4242');
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');

  const [formError, setFormError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (authPhone) {
      setCustomerPhone(authPhone);
    }
  }, [authPhone]);

  // Revalidate with backend when phase changes
  useEffect(() => {
    if (phase === 'review' || phase === 'checkout_details' || phase === 'payment_methods') {
      revalidateCartWithBackend('DELIVERY');
    }
  }, [phase, revalidateCartWithBackend]);

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

  // --- Exact Mathematical Calculations ---
  // When Cash on Delivery is selected, charges increase by ₹20
  const codFee = selectedPaymentMethod === 'CASH' ? 20 : 0;
  const clientSubtotal = scannedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const clientMrpTotal = scannedItems.reduce((acc, it) => acc + (it.mrp || it.price) * it.quantity, 0);
  const clientDiscount = Math.max(0, clientMrpTotal - clientSubtotal);
  const clientDelivery = clientSubtotal >= 499 ? 0 : 40;
  const activeTotalAmount = clientSubtotal + clientDelivery + codFee;
  const gstInclusiveAmount = (clientSubtotal * 0.05).toFixed(2);

  // Active address
  const activeSelectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  // --- Strict Form Validation ("all fill only it will show clickable to pay") ---
  const isAddressValid = Boolean(
    !isAddingNewAddress &&
      activeSelectedAddress &&
      activeSelectedAddress.houseNo.trim() &&
      activeSelectedAddress.area.trim() &&
      activeSelectedAddress.city.trim() &&
      activeSelectedAddress.pinCode.trim().length === 6
  );

  const isCustomerValid = Boolean(
    customerName.trim().length > 0 && customerPhone.replace(/\D/g, '').length === 10
  );

  const isPaymentValid = (() => {
    if (selectedPaymentMethod === 'UPI') {
      if (selectedUpiApp === 'CUSTOM') {
        return upiId.trim().length >= 3 && upiId.includes('@');
      }
      return Boolean(selectedUpiApp);
    }
    if (selectedPaymentMethod === 'CARD') {
      const rawCard = cardNumber.replace(/\s/g, '');
      return (
        rawCard.length >= 15 &&
        cardExpiry.trim().length >= 4 &&
        cardCvv.trim().length >= 3 &&
        cardHolder.trim().length > 0
      );
    }
    if (selectedPaymentMethod === 'CASH') {
      return true; // Valid with COD fee
    }
    return false;
  })();

  const isFormValid = isAddressValid && isCustomerValid && isPaymentValid && scannedItems.length > 0;

  // Reason for button disability (to guide the user clearly)
  const validationHelperText = (() => {
    if (scannedItems.length === 0) return 'Trolley has no items';
    if (isAddingNewAddress) return 'Please save your address details above';
    if (!isAddressValid) return 'Please add or select a delivery address';
    if (!isCustomerValid) return 'Please enter your Full Name & 10-digit Mobile Number';
    if (!isPaymentValid) {
      if (selectedPaymentMethod === 'CARD') return 'Please complete card number, expiry date, and CVV';
      if (selectedPaymentMethod === 'UPI') return 'Please select a UPI app or valid UPI ID';
    }
    return null;
  })();

  // --- BigBasket Style "Use Current Location" Autofill ---
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationSuccessMsg(null);

    // Smooth simulated GPS detection matching BigBasket / Blinkit
    setTimeout(() => {
      setIsLocating(false);
      setLocationSuccessMsg('Location auto-detected via GPS: Indiranagar, Bengaluru');
      setNewAddress((prev) => ({
        ...prev,
        houseNo: prev.houseNo || 'Tower B, Flat 402, Green Meadows',
        area: '12th Main Road, HAL 2nd Stage, Indiranagar',
        landmark: 'Near Metro Station & BDA Complex',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560038',
      }));
    }, 700);
  };

  // --- Save New Address Handler ---
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.houseNo.trim()) {
      setFormError('House / Flat / Building details are required.');
      return;
    }
    if (!newAddress.area.trim()) {
      setFormError('Street / Locality / Area details are required.');
      return;
    }
    if (!newAddress.city.trim() || !newAddress.pinCode.trim() || newAddress.pinCode.trim().length < 6) {
      setFormError('City and valid 6-digit Pincode are required.');
      return;
    }

    const createdAddress: SavedAddress = {
      id: 'addr-' + Date.now(),
      name: customerName,
      phone: customerPhone,
      type: newAddress.type,
      houseNo: newAddress.houseNo.trim(),
      area: newAddress.area.trim(),
      landmark: newAddress.landmark.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim() || 'Karnataka',
      pinCode: newAddress.pinCode.trim(),
      isDefault: newAddress.setAsDefault || savedAddresses.length === 0,
    };

    let updatedList = [...savedAddresses];
    if (createdAddress.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(createdAddress);

    setSavedAddresses(updatedList);
    setSelectedAddressId(createdAddress.id);
    setIsAddingNewAddress(false);
    setFormError(null);
    setLocationSuccessMsg(null);

    // Reset Form
    setNewAddress({
      type: 'HOME',
      houseNo: '',
      area: '',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '',
      setAsDefault: false,
    });
  };

  // --- Set Address as Default ---
  const handleSetDefaultAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setSelectedAddressId(id);
  };

  // --- Cancel Billing & Return to 3D Store ---
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

  // --- Proceed to Payment & Trigger Invoice ---
  const handleProceedToPay = async () => {
    if (!isFormValid || isButtonDisabled) return;
    setFormError(null);
    setIsButtonDisabled(true);
    startProcessingPayment();

    try {
      const addressToUse = activeSelectedAddress!;
      const orderRes = await api.checkoutSimulated({
        customerName,
        customerPhone,
        fulfilmentType: selectedPaymentMethod === 'CASH' ? 'CASH_ON_DELIVERY' : 'ONLINE_DELIVERY',
        addressLine1: `${addressToUse.houseNo}, ${addressToUse.area}${
          addressToUse.landmark ? ', Near ' + addressToUse.landmark : ''
        }`,
        city: addressToUse.city,
        state: addressToUse.state,
        pinCode: addressToUse.pinCode,
        items: scannedItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
        })),
      });

      // Smooth simulated transaction processing
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setPaymentSuccess({
        ...orderRes,
        finalAmount: activeTotalAmount,
      } as any);
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
  // ==============================================================
  if (phase === 'scanning') {
    return (
      <div className="fixed top-20 sm:top-22 right-3 sm:right-6 z-50 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 max-w-[calc(100vw-24px)] w-auto">
        <div className="bg-slate-900/95 backdrop-blur-2xl text-white rounded-2xl px-3.5 sm:px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] border border-slate-700/80 flex items-center gap-2.5 sm:gap-3 select-none">
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
                <span className="truncate">
                  {currentScanningItem ? currentScanningItem.productName : 'Transferring item from trolley...'}
                </span>
                {currentUnitInfo && currentUnitInfo.totalUnits > 1 && (
                  <span className="text-[9px] font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/30 whitespace-nowrap flex-shrink-0">
                    Unit {currentUnitInfo.unitIndex}/{currentUnitInfo.totalUnits}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="text-white font-bold">
                  {currentScanningItem ? `₹${currentScanningItem.price} each` : ''}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold truncate">
                  {totalToScan > 0 ? `Scanned ${Math.min(totalToScan, currentIndex)} of ${totalToScan} units` : 'Scanning...'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 flex-shrink-0" />

          <div className="text-right flex-shrink-0">
            <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Amount</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono leading-tight">
              ₹{runningTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={skipToReview}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            title="Instant Bill: Skip conveyor scan & view bill [Space]"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span className="whitespace-nowrap">Instant Bill</span>
          </button>

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
  // STEP 4: PROCESSING PAYMENT
  // ==============================================================
  if (phase === 'processing') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin shadow-lg" />
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">
            {selectedPaymentMethod === 'CASH'
              ? 'Generating Cash on Delivery Token...'
              : 'Authorizing Secure Payment...'}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm">
            Validating invoice with Martverse hypermarket server and generating official digital receipt.
          </p>
        </div>
      </div>
    );
  }

  // ==============================================================
  // STEP 5: OFFICIAL TAX BILL & EXIT TURNSTILES UNLOCKED
  // ==============================================================
  if (phase === 'success_popup') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-base">
                {selectedPaymentMethod === 'CASH'
                  ? 'Cash on Delivery Order Confirmed!'
                  : 'Payment Verified • Exit Turnstiles Unlocked!'}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                {selectedPaymentMethod === 'CASH'
                  ? 'Keep exact cash of ₹' + activeTotalAmount + ' ready upon courier delivery.'
                  : 'Your RFID digital barcode is cleared. You can now walk freely through the security exit turnstiles.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">TAX INVOICE NUMBER</span>
                <span className="text-base font-black text-slate-900">
                  {completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">
                  {selectedPaymentMethod === 'CASH' ? 'DUE AT DOORSTEP' : 'PAID IN FULL'}
                </span>
                <span className="text-xl font-black text-emerald-700">
                  ₹{activeTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-700 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900">+91 {customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-slate-900">
                  {selectedPaymentMethod === 'UPI'
                    ? `UPI (${selectedUpiApp === 'CUSTOM' ? upiId : selectedUpiApp})`
                    : selectedPaymentMethod === 'CARD'
                    ? `Card (•••• ${cardNumber.slice(-4)})`
                    : 'Cash on Delivery (+₹20 Handling)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-bold text-slate-900 text-right max-w-xs truncate">
                  {activeSelectedAddress.houseNo}, {activeSelectedAddress.area}, {activeSelectedAddress.city} - {activeSelectedAddress.pinCode}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 divide-y divide-slate-100">
              {scannedItems.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between text-[11px]">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {selectedPaymentMethod === 'CASH' && (
                <div className="py-1.5 flex justify-between text-[11px] text-amber-700 font-bold">
                  <span>Cash on Delivery Handling Fee</span>
                  <span>+ ₹20</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueToExit}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-98 cursor-pointer transition-all"
          >
            <span>Return to Supermarket / Exit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MAIN CHECKOUT PAGE:
  // LEFT: Address Management (BigBasket style) + Customer + Payment Method
  // RIGHT: Scanned Items + Live Money Calculation + Validation-Gated Pay Action
  // ==============================================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 overflow-y-auto select-none animate-in fade-in duration-200">
      {/* --- Top Header --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
                  MARTVERSE CHECKOUT & INVOICE
                </h1>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full font-mono">
                  LANE 02
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Doorstep Delivery & In-Store Express Billing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelBilling}
            title="Return to Supermarket Aisle"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Store</span>
          </button>
        </div>
      </header>

      {/* --- Main Two-Column Layout --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Address Management + Customer Details + Payment */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. DELIVERY ADDRESS SECTION (BigBasket Style) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                      1. Delivery Address
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Select delivery location or add another address
                    </p>
                  </div>
                </div>

                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setFormError(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* View A: Saved Addresses List */}
              {!isAddingNewAddress && (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const TypeIcon = addr.type === 'HOME' ? Home : addr.type === 'WORK' ? Building : MapPin;

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Radio Circle */}
                            <div className="mt-0.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              {/* Tag & Default Badge */}
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  <TypeIcon className="w-3 h-3 text-slate-500" />
                                  {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    DEFAULT
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                {addr.houseNo}
                              </p>
                              <p className="text-xs text-slate-600 leading-snug">
                                {addr.area}
                                {addr.landmark ? `, Near ${addr.landmark}` : ''}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                {addr.city}, {addr.state} - <span className="font-mono font-bold text-slate-700">{addr.pinCode}</span>
                              </p>
                            </div>
                          </div>

                          {/* Set as Default Action */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => handleSetDefaultAddress(addr.id, e)}
                                className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline font-semibold cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View B: BigBasket Style "Add New Address" Form with GPS Autofill */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* Current Location Detector Button (BigBasket style) */}
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          Auto-Detect Current Location
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Tap to auto-fill building, street, area, and pincode
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                    >
                      {isLocating ? 'Locating...' : 'Use Current Location'}
                    </button>
                  </div>

                  {locationSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{locationSuccessMsg}</span>
                    </div>
                  )}

                  {/* House / Flat / Building No */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      House / Flat / Floor / Building Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.houseNo}
                      onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                      placeholder="e.g. Flat 402, Tower B, Green Meadows"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Street / Locality / Area */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Street / Locality / Area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      placeholder="e.g. 12th Main Road, HAL 2nd Stage, Indiranagar"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Station / BDA Complex"
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* City, State, Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value.replace(/\D/g, '') })}
                        placeholder="560038"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Address Type (Home / Work / Other) */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Save Address As:
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { type: 'HOME', label: 'Home', icon: Home },
                        { type: 'WORK', label: 'Work', icon: Building },
                        { type: 'OTHER', label: 'Other', icon: MapPin },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = newAddress.type === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, type: item.type as any })}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Set as Default Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newAddress.setAsDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, setAsDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 font-medium">Set as my default delivery address</span>
                  </label>

                  {/* Form Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      Save Address
                    </button>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setFormError(null);
                        }}
                        className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* 2. CUSTOMER CONTACT DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    2. Customer Contact
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    For delivery tracking and invoice delivery
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
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
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-transparent text-xs text-slate-900 font-semibold outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT METHOD (UPI [PhonePe, Paytm, GPay], Card [Details], Cash on Delivery [+₹20]) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    3. Payment Method
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Choose UPI, Credit/Debit Card, or Cash on Delivery
                  </p>
                </div>
              </div>

              {/* 3 Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'UPI', label: 'UPI', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'CASH', label: 'Cash on Delivery', icon: Banknote },
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
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-center">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-view: UPI (3 Options: PhonePe, Paytm, GPay) */}
              {selectedPaymentMethod === 'UPI' && (
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-slate-800 block">
                    Select UPI App:
                  </span>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* PhonePe Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PHONEPE')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'PHONEPE'
                          ? 'bg-purple-50/80 border-purple-600 text-purple-950 shadow-2xs ring-1 ring-purple-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PhonePeIcon />
                      <span className="text-xs font-bold">PhonePe</span>
                    </button>

                    {/* Paytm Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PAYTM')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'PAYTM'
                          ? 'bg-sky-50/80 border-sky-600 text-sky-950 shadow-2xs ring-1 ring-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PaytmIcon />
                      <span className="text-xs font-bold">Paytm</span>
                    </button>

                    {/* Google Pay Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('GPAY')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedUpiApp === 'GPAY'
                          ? 'bg-blue-50/80 border-blue-600 text-blue-950 shadow-2xs ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <GooglePayIcon />
                      <span className="text-xs font-bold">Google Pay</span>
                    </button>
                  </div>

                  {/* Or Custom UPI ID */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-600 font-semibold block">
                        Or enter UPI ID / VPA
                      </label>
                      <span className="text-[10px] text-slate-400">e.g. yourname@okhdfcbank</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setSelectedUpiApp('CUSTOM');
                        }}
                        placeholder="username@okhdfcbank"
                        className="flex-1 bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: Card (Details input) */}
              {selectedPaymentMethod === 'CARD' && (
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="text-[11px] text-slate-700 font-bold block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(v);
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-700 font-bold block mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold block mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold block mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: Cash on Delivery (+₹20 charges increase) */}
              {selectedPaymentMethod === 'CASH' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Banknote className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>Cash on Delivery Selected</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Physical cash will be collected at your doorstep upon order arrival.
                  </p>
                  <div className="bg-white/80 border border-amber-300/60 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>COD Handling Fee (Increased by ₹20):</span>
                    <span className="font-mono text-amber-950">+ ₹20</span>
                  </div>
                </div>
              )}

              {/* General Form Error Notice */}
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Scanned Items + Live Bill Calculations + Pay Button */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            {/* Scanned Items Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Scanned Items ({scannedItems.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {scannedItems.reduce((acc, it) => acc + it.quantity, 0)} units
                </span>
              </div>

              {/* Scrollable Scanned Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
                {scannedItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 flex-shrink-0">
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
                        <span className="font-semibold text-slate-900 truncate block text-xs" title={item.productName}>
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ₹{item.price} each
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Total */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-slate-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-slate-900 text-xs w-14 text-right">
                        ₹{item.price * item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeScannedItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary & Calculations */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Order Summary
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Exact Calculation
                </span>
              </div>

              {/* Itemized Calculation Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>Items Subtotal:</span>
                  <span className="text-slate-900 font-semibold font-mono">
                    ₹{clientSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {clientDiscount > 0 && (
                  <div className="flex justify-between text-slate-600 font-normal">
                    <span>Savings on MRP:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      - ₹{clientDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-normal">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-slate-900">
                    {clientDelivery === 0 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="line-through text-slate-400 font-normal text-[11px]">₹40</span>
                        <span>FREE</span>
                      </span>
                    ) : (
                      `₹${clientDelivery}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 font-normal">
                  <span>Taxes (GST 5% Included in MRP):</span>
                  <span className="font-mono text-slate-600 font-medium">
                    ₹{gstInclusiveAmount} (Included)
                  </span>
                </div>

                {/* COD Handling Fee (ONLY when Cash on Delivery is selected) */}
                {selectedPaymentMethod === 'CASH' && (
                  <div className="flex justify-between text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-700" />
                      Cash on Delivery Handling:
                    </span>
                    <span className="font-mono font-bold">+ ₹20</span>
                  </div>
                )}

                {/* Grand Total Row */}
                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block leading-tight">TOTAL PAYABLE AMOUNT</span>
                    <span className="text-[10px] text-slate-400">
                      {selectedPaymentMethod === 'CASH' ? 'Includes ₹20 COD handling charge' : 'Inclusive of all applicable taxes'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    ₹{activeTotalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Validation Warning Notice if not all fields are filled */}
              {!isFormValid && validationHelperText && (
                <div className="bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{validationHelperText}</span>
                </div>
              )}

              {/* Primary Action Button ("all fill only it will show clickable to pay") */}
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={!isFormValid || isButtonDisabled}
                className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  isFormValid && !isButtonDisabled
                    ? 'bg-slate-900 hover:bg-black text-white shadow-lg cursor-pointer active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isButtonDisabled ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {selectedPaymentMethod === 'CASH'
                        ? `Place COD Order • ₹${activeTotalAmount.toLocaleString('en-IN')}`
                        : `Pay ₹${activeTotalAmount.toLocaleString('en-IN')}`}
                    </span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>100% Safe & Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Instant digital tax invoice generation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
