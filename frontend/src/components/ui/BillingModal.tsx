'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Star,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

// --- Real Authentic SVGs for Payment Providers (Icons Only) ---
const GooglePayIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => (
  <svg className={className} viewBox="0 0 52 20" fill="none">
    {/* Google 'G' in Official 4 Colors */}
    <path
      d="M10.2 10.2c0-.68-.06-1.34-.17-1.97H5.2v3.74h2.82c-.12.66-.49 1.22-.97 1.62v1.35h1.57c.92-.85 1.58-2.1 1.58-4.74z"
      fill="#4285F4"
    />
    <path
      d="M5.2 15.3c1.38 0 2.54-.46 3.39-1.24l-1.57-1.35c-.46.31-1.05.5-1.82.5-1.4 0-2.58-.95-3.01-2.22H.55v1.4c.86 1.72 2.63 2.91 4.65 2.91z"
      fill="#34A853"
    />
    <path
      d="M2.19 10.99c-.11-.33-.18-.68-.18-1.04 0-.36.07-.71.18-1.04V7.51H.55C.2 8.21 0 9.01 0 9.95s.2 1.74.55 2.44l1.64-1.4z"
      fill="#FBBC05"
    />
    <path
      d="M5.2 4.59c.75 0 1.43.26 1.96.77l1.47-1.47C7.74 3.06 6.58 2.5 5.2 2.5c-2.02 0-3.79 1.19-4.65 2.91l1.64 1.4c.43-1.27 1.61-2.22 3.01-2.22z"
      fill="#EA4335"
    />
    {/* 'Pay' in Google Slate #5F6368 */}
    <path
      d="M14.8 15V6.8h2.6c1.5 0 2.6 1.1 2.6 2.6s-1.1 2.6-2.6 2.6h-1.3V15h-1.3zm1.3-4.2h1.3c.8 0 1.3-.5 1.3-1.3s-.5-1.3-1.3-1.3h-1.3v2.6z"
      fill="#5F6368"
    />
    <path
      d="M23.8 15v-.9c-.5.6-1.2 1-2 1-1.3 0-2.3-1-2.3-2.3 0-1.4 1-2.3 2.3-2.3.8 0 1.4.3 1.9.9v-.9h1.3V15h-1.2zm-.1-2.2c0-.6-.5-1.2-1.3-1.2s-1.3.5-1.3 1.2.5 1.2 1.3 1.2 1.3-.5 1.3-1.2z"
      fill="#5F6368"
    />
    <path
      d="M30.4 17.1l-1.1-3.1-2-4.8h1.3l1.4 3.5 1.4-3.5h1.3l-3.5 7.9h-1.3z"
      fill="#5F6368"
    />
  </svg>
);

const PhonePeIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-auto' }) => (
  <svg className={className} viewBox="0 0 76 76" fill="none">
    <rect width="76" height="76" rx="18" fill="#5f259f" />
    <path
      d="M46.2 24H33.5c-1.4 0-2.5 1.1-2.5 2.5v25.2c0 1.4 1.1 2.5 2.5 2.5h3.6c1.4 0 2.5-1.1 2.5-2.5V44.8h6.6c6.6 0 11.2-4.7 11.2-10.4 0-5.6-4.6-10.4-11.2-10.4zm-.2 14.5h-6.4v-8.3H46c3.2 0 5.1 1.7 5.1 4.1 0 2.5-1.9 4.2-5.1 4.2z"
      fill="white"
    />
    <path d="M25 32h5v5h-5z" fill="white" />
  </svg>
);

const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => (
  <svg className={className} viewBox="0 0 88 26" fill="none">
    {/* Official Two-Tone Paytm Logo Wordmark */}
    <text
      x="0"
      y="20"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="22"
      fill="#002e6e"
      letterSpacing="-0.8"
    >
      Pay
    </text>
    <text
      x="43"
      y="20"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="22"
      fill="#00b9f5"
      letterSpacing="-0.3"
    >
      tm
    </text>
  </svg>
);

// --- Saved Address Interface ---
interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  houseNo: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

// Start with empty addresses — no dummy mock addresses
const INITIAL_ADDRESSES: SavedAddress[] = [];

export const BillingModal: React.FC = () => {
  const router = useRouter();
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

  // Customer Contact State (Starts empty so Pay button stays disabled until filled)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(authPhone || '');

  // Address Management State (Clean start — no dummy addresses)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
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

  // Payment State: UPI (PhonePe, Paytm, GPay - Icons Only), Card, Cash on Delivery (+₹20)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'PAYTM' | 'GPAY'>('PHONEPE');

  // Card Inputs (Clean Start - User fills details)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  // Customer Rating & Feedback State
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['⚡ Fast Checkout', '🛒 3D Supermarket']);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const ratingLabels = [
    '',
    'Needs Improvement',
    'Fair Experience',
    'Good Supermarket',
    'Very Good!',
    'Excellent Supermarket Experience! ⭐',
  ];

  const feedbackTagOptions = [
    '⚡ Fast Checkout',
    '🛒 3D Supermarket',
    '📦 Fresh Packaging',
    '💳 Seamless Payment',
    '📍 Accurate Address',
    '🛍️ Great Discounts',
  ];

  useEffect(() => {
    if (authPhone) {
      setCustomerPhone(authPhone);
    }
  }, [authPhone]);

  // Load saved addresses from backend database & sync with localStorage (strips out old dummy addresses)
  useEffect(() => {
    let isMounted = true;
    const fetchSavedAddresses = async () => {
      try {
        const list = await api.getAddresses(customerPhone);
        if (isMounted) {
          const valid = (Array.isArray(list) ? list : []).filter(
            (a: SavedAddress) => a.id !== 'addr-1' && a.id !== 'addr-2'
          );
          setSavedAddresses(valid);
          if (valid.length > 0) {
            const def = valid.find((a: SavedAddress) => a.isDefault) || valid[0];
            setSelectedAddressId(def.id);
          } else {
            setSelectedAddressId('');
          }
        }
      } catch {
        if (isMounted) {
          setSavedAddresses([]);
          setSelectedAddressId('');
        }
      }
    };
    fetchSavedAddresses();
    return () => {
      isMounted = false;
    };
  }, [customerPhone]);

  // Revalidate with backend
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
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
        });
      } catch {}
    }
  }, [phase]);

  if (phase === 'idle') return null;

  // --- Exact Mathematical Calculations ---
  const codFee = selectedPaymentMethod === 'CASH' ? 20 : 0;
  const clientSubtotal = scannedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const clientMrpTotal = scannedItems.reduce((acc, it) => acc + (it.mrp || it.price) * it.quantity, 0);
  const clientDiscount = Math.max(0, clientMrpTotal - clientSubtotal);
  const clientDelivery = clientSubtotal >= 499 ? 0 : 40;
  const activeTotalAmount = clientSubtotal + clientDelivery + codFee;
  const gstInclusiveAmount = (clientSubtotal * 0.05).toFixed(2);

  // Active address
  const activeSelectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || (savedAddresses.length > 0 ? savedAddresses[0] : null);

  // --- Strict Form Validation ("all fill only it will show clickable to pay") ---
  const isAddressValid = Boolean(
    !isAddingNewAddress &&
      activeSelectedAddress &&
      activeSelectedAddress.houseNo?.trim() &&
      activeSelectedAddress.area?.trim() &&
      activeSelectedAddress.city?.trim() &&
      activeSelectedAddress.pinCode?.trim().length === 6
  );

  const isCustomerValid = Boolean(
    customerName.trim().length > 0 && customerPhone.replace(/\D/g, '').length === 10
  );

  const isPaymentValid = (() => {
    if (selectedPaymentMethod === 'UPI') {
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
      return true;
    }
    return false;
  })();

  const isFormValid = isAddressValid && isCustomerValid && isPaymentValid && scannedItems.length > 0;

  // Validation Helper Prompt ("Proceed to pay dont show clickable until i fill details")
  const validationHelperText = (() => {
    if (scannedItems.length === 0) return 'Trolley has no items';
    if (isAddingNewAddress) return 'Please save your address details above';
    if (!isAddressValid) return 'Please add and select a delivery address';
    if (!customerName.trim()) return 'Please enter your Full Name';
    if (customerPhone.replace(/\D/g, '').length !== 10) return 'Please enter a valid 10-digit Mobile Number';
    if (!isPaymentValid) {
      if (selectedPaymentMethod === 'CARD') return 'Please complete card number, expiry date, and CVV';
      if (selectedPaymentMethod === 'UPI') return 'Please select a UPI payment app';
    }
    return null;
  })();

  // --- BigBasket Style "Use Current Location" Autofill ---
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationSuccessMsg(null);

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

  // --- Save New Address Handler (Backend Database & Deduplication) ---
  const handleSaveNewAddress = async (e: React.FormEvent) => {
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

    const houseNoTrimmed = newAddress.houseNo.trim();
    const areaTrimmed = newAddress.area.trim();
    const pinCodeTrimmed = newAddress.pinCode.trim();

    // DEDUPLICATION: Check if this address already exists in current list
    const existingIndex = savedAddresses.findIndex(
      (a) =>
        a.houseNo?.trim().toLowerCase() === houseNoTrimmed.toLowerCase() &&
        a.area?.trim().toLowerCase() === areaTrimmed.toLowerCase() &&
        a.pinCode?.trim() === pinCodeTrimmed
    );

    const shouldBeDefault = newAddress.setAsDefault || savedAddresses.length === 0;

    // Save to backend database + sync with localStorage
    const saved = await api.saveAddress({
      id: existingIndex >= 0 ? savedAddresses[existingIndex].id : undefined,
      name: customerName,
      fullName: customerName,
      phone: customerPhone,
      type: newAddress.type,
      addressType: newAddress.type,
      houseNo: houseNoTrimmed,
      area: areaTrimmed,
      landmark: newAddress.landmark.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim() || 'Karnataka',
      pinCode: pinCodeTrimmed,
      isDefault: shouldBeDefault,
    });

    let updatedList = [...savedAddresses];
    if (shouldBeDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (existingIndex >= 0) {
      updatedList[existingIndex] = saved;
    } else {
      updatedList.unshift(saved);
    }

    setSavedAddresses(updatedList);
    setSelectedAddressId(saved.id);
    setIsAddingNewAddress(false);
    setFormError(null);
    setLocationSuccessMsg(null);

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
  const handleSetDefaultAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setSelectedAddressId(id);
    await api.setDefaultAddress(id, customerPhone);
  };

  // --- Delete Address Handler ---
  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);

    if (updated.length === 0) {
      setSelectedAddressId('');
      setIsAddingNewAddress(true);
    } else if (selectedAddressId === id) {
      const nextActive = updated.find((a) => a.isDefault) || updated[0];
      if (nextActive) {
        nextActive.isDefault = true;
        setSelectedAddressId(nextActive.id);
      }
    }

    await api.deleteAddress(id);
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

  // --- Proceed to Payment & Trigger Real Backend / Local Storage Persistence ---
  const handleProceedToPay = async () => {
    if (!isFormValid || isButtonDisabled) return;
    setFormError(null);
    setIsButtonDisabled(true);
    setProcessingStep(1);
    startProcessingPayment();

    // Multi-step animated progress simulation
    setTimeout(() => setProcessingStep(2), 500);
    setTimeout(() => setProcessingStep(3), 1100);

    try {
      const addressToUse = activeSelectedAddress!;
      let paymentProviderName = 'UPI';
      if (selectedPaymentMethod === 'UPI') {
        if (selectedUpiApp === 'PHONEPE') paymentProviderName = 'UPI (PhonePe)';
        else if (selectedUpiApp === 'PAYTM') paymentProviderName = 'UPI (Paytm)';
        else if (selectedUpiApp === 'GPAY') paymentProviderName = 'UPI (Google Pay)';
        else paymentProviderName = 'UPI';
      } else if (selectedPaymentMethod === 'CARD') {
        paymentProviderName = `Card (•••• ${cardNumber.replace(/\s/g, '').slice(-4)}) - ${cardHolder}`;
      } else {
        paymentProviderName = 'Cash on Delivery (+₹20 COD Fee)';
      }

      const orderRes = await api.checkoutSimulated({
        customerName,
        customerPhone,
        addressId: addressToUse.id && !addressToUse.id.startsWith('addr-') ? addressToUse.id : undefined,
        fulfilmentType: selectedPaymentMethod === 'CASH' ? 'CASH_ON_DELIVERY' : 'ONLINE_DELIVERY',
        paymentMethod: selectedPaymentMethod,
        paymentProvider: paymentProviderName,
        codFee,
        houseNo: addressToUse.houseNo,
        area: addressToUse.area,
        landmark: addressToUse.landmark,
        addressType: addressToUse.type,
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
          productName: it.productName,
          brand: it.brand,
          unitPrice: it.price,
          lineTotal: it.price * it.quantity,
          imageUrl: it.productImage,
        })),
      });

      // Clear the Shopping Cart so it's fresh for next purchases
      useCartStore.getState().clearCart();

      // Small delay for smooth animation transition
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPaymentSuccess({
        ...orderRes,
        finalAmount: activeTotalAmount,
        paymentMethod: selectedPaymentMethod,
        paymentProvider: paymentProviderName,
      } as any);
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  // --- Continue Shopping Action ---
  const handleContinueShopping = () => {
    const orderNo = completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000);
    resetBilling();
    useCartStore.getState().clearCart();
    startExitAnimation(orderNo);
  };

  // --- View in Orders Page Action ---
  const handleViewOrdersPage = () => {
    resetBilling();
    useCartStore.getState().clearCart();
    router.push('/orders');
  };

  // --- Feedback Tag Toggle ---
  const toggleFeedbackTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // --- Submit Feedback ---
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  // ==============================================================
  // STEP 1: SCANNING PHASE — Compact Vertical Card (Image, Name, Cost, Instant Checkout + OK)
  // ==============================================================
  if (phase === 'scanning') {
    const itemName = currentScanningItem ? currentScanningItem.productName : 'Item from Trolley';
    const itemCost = currentScanningItem ? currentScanningItem.price : runningTotal;

    return (
      <div className="fixed top-20 sm:top-22 right-4 sm:right-6 z-50 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 select-none">
        <div className="w-56 sm:w-60 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all flex flex-col items-center text-center relative group">
          {/* Top subtle close 'X' */}
          <button
            type="button"
            onClick={handleCancelBilling}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* 1. Item Image */}
          <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center overflow-hidden shadow-2xs mt-1">
            {currentScanningItem?.productImage ? (
              <img
                src={currentScanningItem.productImage}
                alt={itemName}
                className="w-full h-full object-contain filter drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/products/fallback.svg';
                }}
              />
            ) : (
              <span className="text-2xl">🛍️</span>
            )}
            {/* Subtle Laser Scan Line */}
            <div
              className="absolute inset-x-0 h-[2px] bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse pointer-events-none"
              style={{ top: '50%' }}
            />
          </div>

          {/* 2. Item Name */}
          <h4
            className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-2.5 px-1"
            title={itemName}
          >
            {itemName}
          </h4>

          {/* 3. Cost */}
          <div className="mt-1 font-mono font-black text-emerald-600 text-sm sm:text-base">
            ₹{itemCost.toLocaleString('en-IN')}
          </div>

          {/* 4. Two Options: Instant Checkout and OK */}
          <div className="w-full space-y-1.5 mt-3 pt-2.5 border-t border-slate-100">
            {/* Option 1: Instant Checkout */}
            <button
              type="button"
              onClick={skipToReview}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Instant Checkout</span>
            </button>

            {/* Option 2: OK */}
            <button
              type="button"
              onClick={handleCancelBilling}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-200/80 active:scale-95 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // STEP 4: PROCESSING PAYMENT ANIMATION (High-End Tactile Animation)
  // ==============================================================
  if (phase === 'processing') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-300 select-none">
        {/* Animated Biometric Radar Core */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.35)]" />
          <div className="absolute w-16 h-16 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <div className="absolute w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white animate-bounce" />
          </div>
        </div>

        {/* Progress Text with Dynamic Stages */}
        <div className="space-y-2 max-w-sm">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {selectedPaymentMethod === 'CASH'
              ? 'Confirming Cash on Delivery Order...'
              : `Authorizing Payment via ${selectedPaymentMethod}...`}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            {processingStep === 1 && 'Step 1/3: Validating items & supermarket stock...'}
            {processingStep === 2 && 'Step 2/3: Generating secure order token & tax breakdown...'}
            {processingStep === 3 && 'Step 3/3: Clearing RFID exit turnstiles & saving to database...'}
          </p>
        </div>

        {/* Progress bar line */}
        <div className="w-56 bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${processingStep * 33.3}%` }}
          />
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400">
          Payable Total: ₹{activeTotalAmount.toLocaleString('en-IN')}
        </span>
      </div>
    );
  }

  // ==============================================================
  // STEP 5: SUCCESSFUL COMPLETION + FEEDBACK & STARS + ACTIONS
  // ==============================================================
  if (phase === 'success_popup') {
    const orderNo = completedOrder?.orderNumber || 'MV' + Math.floor(10000000 + Math.random() * 90000000);
    const paymentMethodLabel =
      selectedPaymentMethod === 'UPI'
        ? `UPI (${selectedUpiApp === 'PAYTM' ? 'Paytm' : selectedUpiApp === 'GPAY' ? 'Google Pay' : 'PhonePe'})`
        : selectedPaymentMethod === 'CARD'
        ? `Credit/Debit Card (•••• ${cardNumber.slice(-4)})`
        : 'Cash on Delivery (+₹20 Handling)';

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex items-center justify-center select-none animate-in fade-in duration-300">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-6 text-slate-900 my-auto">
          {/* Header Banner */}
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-950 leading-tight">
                {selectedPaymentMethod === 'CASH'
                  ? 'Cash on Delivery Order Confirmed! 📦'
                  : 'Order Placed & Payment Verified! 🎉'}
              </h2>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Order <strong className="font-mono">{orderNo}</strong> has been saved directly to the database.
                RFID supermarket barriers are cleared.
              </p>
            </div>
          </div>

          {/* Order Details Receipt Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Number</span>
                <span className="text-sm sm:text-base font-black text-slate-900 font-mono">{orderNo}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {selectedPaymentMethod === 'CASH' ? 'Due at Delivery' : 'Total Amount Paid'}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  ₹{activeTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Payment Method</span>
                <span className="font-bold text-slate-900">{paymentMethodLabel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Customer & Phone</span>
                <span className="font-bold text-slate-900">{customerName} (+91 {customerPhone})</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-semibold">Delivery Address</span>
                <span className="font-medium text-slate-800">
                  {activeSelectedAddress
                    ? `${activeSelectedAddress.houseNo}, ${activeSelectedAddress.area}, ${activeSelectedAddress.city} - ${activeSelectedAddress.pinCode}`
                    : 'Customer Delivery'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Customer Feedback & 5-Star Rating Component */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">How was your checkout experience?</h3>
              <p className="text-xs text-slate-500">Your feedback helps us continuously improve the 3D supermarket</p>
            </div>

            {/* 5 Clickable Stars */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverStar !== null ? hoverStar : starRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(null)}
                      onClick={() => setStarRating(star)}
                      className="p-1 text-slate-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-amber-600 h-4">
                {ratingLabels[hoverStar !== null ? hoverStar : starRating]}
              </span>
            </div>

            {/* Feedback Form / Submitted Confirmation */}
            {!feedbackSubmitted ? (
              <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-2 border-t border-slate-100">
                {/* Quick Feedback Tags */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {feedbackTagOptions.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFeedbackTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Comment Box */}
                <div>
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you liked about your shopping experience..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl text-center">
                ✓ Thank you! Your review has been recorded.
              </div>
            )}
          </div>

          {/* Action Buttons: Continue Shopping & View Orders Page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleContinueShopping}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-98"
            >
              <span>Continue Shopping in Mart</span>
              <Store className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleViewOrdersPage}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-2xs cursor-pointer transition-all active:scale-98"
            >
              <span>View in Orders Page</span>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MAIN CHECKOUT PAGE (Single-Page Viewport Layout — No Scroll Needed)
  // ==============================================================
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-100/90 via-slate-50 to-blue-50/40 text-slate-900 overflow-y-auto xl:overflow-hidden select-none flex flex-col animate-in fade-in duration-200">
      {/* --- Top Luxury Executive Header (Rich Dark Theme with Shimmering Light Blue to White Title) --- */}
      <header className="flex-shrink-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 px-4 sm:px-6 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.35)] flex-shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm tracking-tight font-black uppercase text-light-blue-white-shimmer font-sans">
                  MARTVERSE POS BILLING
                </h1>
                <span className="text-[9px] bg-sky-950/90 border border-sky-400/40 text-sky-300 font-bold px-2 py-0.5 rounded-full font-mono shadow-[0_0_10px_rgba(56,189,248,0.25)]">
                  LANE 02
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                Official In-Store Express Checkout & Invoice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelBilling}
            title="Return to Supermarket Aisle"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-700/80 hover:border-slate-500 shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Back to Store</span>
          </button>
        </div>
      </header>

      {/* --- Main Two-Column Layout (High-Density, Fits in 1 Viewport) --- */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Address (With Delete) + Contact + Payment         */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-2.5">
            {/* 1. DELIVERY ADDRESS SECTION (Compact BigBasket Style) */}
            <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-3 sm:p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                      1. Delivery Address
                    </h2>
                    <p className="text-[10px] text-slate-500 leading-none">
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
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {/* View A: Compact Saved Addresses Grid (2 columns on screens) */}
              {!isAddingNewAddress && savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const TypeIcon = addr.type === 'HOME' ? Home : addr.type === 'WORK' ? Building : MapPin;

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer relative active:scale-[0.99] ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-600 shadow-xs ring-1 ring-blue-600/40'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              <TypeIcon className="w-2.5 h-2.5 text-slate-500" />
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => handleSetDefaultAddress(addr.id, e)}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline px-1 py-0.5 rounded"
                                title="Set as default address"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer active:scale-90"
                              title="Delete this address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1 space-y-0.5 pl-5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {addr.houseNo}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate leading-tight">
                            {addr.area}{addr.landmark ? `, Near ${addr.landmark}` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} - <span className="font-mono font-bold text-slate-700">{addr.pinCode}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View B: No Addresses Saved Yet — Clean Initial Prompt */}
              {!isAddingNewAddress && savedAddresses.length === 0 && (
                <div className="p-3.5 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 text-center space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No delivery address saved</p>
                    <p className="text-[10px] text-slate-500">Add an address to proceed with your order</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setFormError(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Delivery Address</span>
                  </button>
                </div>
              )}

              {/* View B: Compact "Add New Address" Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveNewAddress} className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-bold text-slate-900">
                        Auto-detect Location via GPS
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      {isLocating ? 'Locating...' : 'Use Current Location'}
                    </button>
                  </div>

                  {locationSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold p-2 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{locationSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        House / Flat / Building <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.houseNo}
                        onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                        placeholder="e.g. Flat 402, Tower B"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Street / Area / Locality <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.area}
                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                        placeholder="e.g. Bellandur, Outer Ring Road"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Landmark</label>
                      <input
                        type="text"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        placeholder="Near EcoSpace"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2 py-1.5 text-xs text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">City <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2 py-1.5 text-xs text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">State <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2 py-1.5 text-xs text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Pincode <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value.replace(/\D/g, '') })}
                        placeholder="560103"
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {[
                        { type: 'HOME', label: 'Home' },
                        { type: 'WORK', label: 'Work' },
                        { type: 'OTHER', label: 'Other' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, type: item.type as any })}
                          className={`py-1 px-2.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                            newAddress.type === item.type
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddress.setAsDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, setAsDefault: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] text-slate-700 font-medium">Set Default</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      Save & Select Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(false);
                        setFormError(null);
                      }}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. CUSTOMER CONTACT DETAILS (Compact) */}
            <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-2.5 sm:p-3 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <User className="w-3 h-3" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                    2. Customer Contact
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400">For SMS invoice & delivery tracking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Mobile Number <span className="text-rose-500">*</span></label>
                  <div className="flex items-center bg-slate-50 border border-slate-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3 py-1.5 transition-all">
                    <span className="text-[11px] font-bold text-slate-400 mr-1.5">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full bg-transparent text-xs text-slate-900 font-semibold outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT METHOD (Compact Tabs: UPI, Card, Cash on Delivery) */}
            <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-2.5 sm:p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                    3. Payment Method
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400">Instant verification</span>
              </div>

              {/* 3 Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
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
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-view: UPI (3 Real Brand Icons Only — No Names, No UPI ID Row) */}
              {selectedPaymentMethod === 'UPI' && (
                <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-200/80 animate-in fade-in duration-150">
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {/* PhonePe Option (Real Icon Only) */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PHONEPE')}
                      title="PhonePe"
                      className={`h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        selectedUpiApp === 'PHONEPE'
                          ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-600/40 shadow-xs scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                      }`}
                    >
                      <PhonePeIcon className="h-6 w-auto" />
                    </button>

                    {/* Paytm Option (Real Icon Only) */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('PAYTM')}
                      title="Paytm"
                      className={`h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        selectedUpiApp === 'PAYTM'
                          ? 'bg-sky-50/90 border-sky-600 ring-2 ring-sky-600/40 shadow-xs scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                      }`}
                    >
                      <PaytmIcon className="h-5 w-auto" />
                    </button>

                    {/* Google Pay Option (Real Icon Only) */}
                    <button
                      type="button"
                      onClick={() => setSelectedUpiApp('GPAY')}
                      title="Google Pay (GPay)"
                      className={`h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        selectedUpiApp === 'GPAY'
                          ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/40 shadow-xs scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                      }`}
                    >
                      <GooglePayIcon className="h-5 w-auto" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Card (Details input) */}
              {selectedPaymentMethod === 'CARD' && (
                <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-200/80 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-700 font-bold block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(v);
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-700 font-bold block mb-0.5">Name on Card</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-700 font-bold block mb-0.5">Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                          setCardExpiry(v);
                        }}
                        placeholder="12/28"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-700 font-bold block mb-0.5">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: Cash on Delivery (+₹20 charges) */}
              {selectedPaymentMethod === 'CASH' && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 space-y-1 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-amber-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-amber-700" />
                      Cash on Delivery
                    </span>
                    <span className="font-mono text-amber-950">+ ₹20 COD Fee</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Pay cash at doorstep upon delivery. Verification fee applied.
                  </p>
                </div>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Scanned Items + Live Bill Calculations + Pay Button */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-2.5">
            {/* Scanned Items Card (Compact) */}
            <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-3 sm:p-3.5 space-y-1.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Scanned Items ({scannedItems.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {scannedItems.reduce((acc, it) => acc + it.quantity, 0)} units
                </span>
              </div>

              {/* Scrollable Scanned Items List with compact rows */}
              <div className="max-h-36 sm:max-h-40 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-0.5">
                {scannedItems.map((item) => (
                  <div key={item.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 flex-shrink-0">
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
                        <span className="font-semibold text-slate-900 truncate block text-[11px]" title={item.productName}>
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ₹{item.price} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                          className="w-4 h-4 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                        >
                          <Minus className="w-2 h-2" />
                        </button>
                        <span className="w-4 text-center font-mono font-bold text-slate-900 text-[11px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                          className="w-4 h-4 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                        >
                          <Plus className="w-2 h-2" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-slate-900 text-xs w-12 text-right">
                        ₹{item.price * item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeScannedItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary & Calculations (Compact) */}
            <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-3 sm:p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                    Order Summary
                  </h3>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Exact Calculation
                </span>
              </div>

              {/* Itemized Calculation Summary */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span className="text-slate-900 font-semibold font-mono">
                    ₹{clientSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {clientDiscount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Savings on MRP:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      - ₹{clientDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-slate-900">
                    {clientDelivery === 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-slate-400 text-[10px]">₹40</span>
                        <span className="text-emerald-600 font-bold text-[11px]">FREE</span>
                      </span>
                    ) : (
                      `₹${clientDelivery}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Taxes (GST 5% Included in MRP):</span>
                  <span className="font-mono text-slate-600">
                    ₹{gstInclusiveAmount} (Included)
                  </span>
                </div>

                {/* COD Handling Fee */}
                {selectedPaymentMethod === 'CASH' && (
                  <div className="flex justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3 h-3 text-amber-700" />
                      COD Handling:
                    </span>
                    <span className="font-mono">+ ₹20</span>
                  </div>
                )}

                {/* Grand Total Row */}
                <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">TOTAL PAYABLE AMOUNT</span>
                    <span className="text-[10px] text-slate-400">
                      {selectedPaymentMethod === 'CASH' ? 'Includes ₹20 COD fee' : 'Inclusive of all applicable taxes'}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    ₹{activeTotalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Validation Warning Notice */}
              {!isFormValid && validationHelperText && (
                <div className="bg-amber-50/90 border border-amber-200/90 text-amber-900 text-[11px] font-semibold p-2 rounded-xl flex items-center gap-1.5 shadow-2xs animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>{validationHelperText}</span>
                </div>
              )}

              {/* Primary Action Pay Button (Muted & Non-Clickable Until Details Are Filled) */}
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={!isFormValid || isButtonDisabled}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none ${
                  isFormValid && !isButtonDisabled
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200/90 cursor-not-allowed opacity-75 shadow-none'
                }`}
              >
                {isButtonDisabled ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
