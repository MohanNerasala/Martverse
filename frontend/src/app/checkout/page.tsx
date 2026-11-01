'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';
import {
  Store,
  RotateCcw,
  MapPin,
  Plus,
  Home,
  Building,
  User,
  CreditCard,
  QrCode,
  Banknote,
  Barcode,
  Minus,
  Trash2,
  Receipt,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Star,
  ArrowRight,
  Zap,
  X,
  Compass,
  PackageCheck,
  ShoppingBag,
  Check,
  Phone,
  Lock,
  Info,
  ChevronRight,
  Sparkles,
  Truck,
  ArrowLeft,
  Clock,
  BadgeCheck,
} from 'lucide-react';

// --- Authentic Official SVGs for Payment Providers ---
const GooglePayIcon: React.FC<{ className?: string }> = ({ className = 'h-5.5 w-auto' }) => (
  <svg className={className} viewBox="0 0 62 22" fill="none">
    {/* Official Google 4-Color 'G' Logo */}
    <g transform="translate(1, 1)">
      <path d="M19.6 10.2c0-.7-.06-1.4-.18-2H10v3.9h5.4c-.2 1.3-.9 2.4-2 3.1v2.6h3.2c1.9-1.8 3-4.4 3-7.6z" fill="#4285F4" />
      <path d="M10 20c2.7 0 5-1 6.6-2.6l-3.2-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H1.1v2.6C2.8 17.6 6.1 20 10 20z" fill="#34A853" />
      <path d="M4.4 11.6c-.2-.6-.3-1.4-.3-2.1s.1-1.4.3-2.1V4.8H1.1C.4 6.2 0 7.8 0 9.5s.4 3.3 1.1 4.7l3.3-2.6z" fill="#FBBC05" />
      <path d="M10 4c1.5 0 2.8.5 3.8 1.5l2.9-2.9C15 1 12.7 0 10 0 6.1 0 2.8 2.4 1.1 5.8l3.3 2.6C5.2 6 7.4 4 10 4z" fill="#EA4335" />
    </g>
    {/* Official 'Pay' in Google Slate #3C4043 */}
    <g transform="translate(26, 3)" fill="#3C4043">
      <path d="M1.8 15V2h4.2c2.2 0 3.8 1.6 3.8 3.8s-1.6 3.8-3.8 3.8H4v5.4H1.8zm2.2-7.2h2c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8H4v3.6z" />
      <path d="M14.5 15.2c-1 0-1.8-.4-2.4-1.1v.9h-2.1V6.5h2.1v.9c.6-.7 1.4-1.1 2.4-1.1 1.8 0 3.2 1.6 3.2 4.4 0 2.8-1.4 4.5-3.2 4.5zm-.4-2c1 0 1.8-.9 1.8-2.4s-.8-2.4-1.8-2.4-1.8.9-1.8 2.4.8 2.4 1.8 2.4z" />
      <path d="M22.5 18.2l-1.4-3.5-3-7.7h2.2l1.8 5.2 1.8-5.2h2.2l-4.2 11.2h-2.2v-.2z" />
    </g>
  </svg>
);

const PhonePeIcon: React.FC<{ className?: string }> = ({ className = 'h-7 w-auto' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none">
    {/* Official PhonePe Deep Purple Squircle */}
    <rect width="40" height="40" rx="10" fill="#5F259F" />
    {/* Devanagari 'पे' Glyph */}
    <g fill="#FFFFFF">
      <rect x="9.5" y="11.5" width="20" height="3.2" rx="1" />
      <rect x="22.2" y="11.5" width="3.4" height="19.5" rx="1" />
      <path d="M13.5 14v6.2c0 3.8 2.8 6.5 6.6 6.5h2.1V23.5h-2c-2 0-3.3-1.3-3.3-3.3V14h-3.4z" />
      <path d="M22.5 12.2c-.8-2.6-2.5-4.6-4.8-5.4-1.8-.6-3.2-.2-3.8.9-.6 1.1-.3 2.5 1 3.5 1.4 1.1 3.2 1.4 4.8 1.4l2.8-.4zm-3-2.6c-.7-.5-.9-1.2-.6-1.7.3-.5.9-.6 1.8-.3 1.2.4 2.2 1.5 2.6 2.8-1.5 0-2.8-.2-3.8-.8z" />
    </g>
  </svg>
);

const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'h-5.5 w-auto' }) => (
  <svg className={className} viewBox="0 0 82 22" fill="none">
    {/* Paytm Wordmark: Navy 'Pay' + Cyan 'tm' */}
    <path d="M4 3.5h5.5c3.5 0 6 2.2 6 5.5s-2.5 5.5-6 5.5H7.5V20H4V3.5zm3.5 8h1.8c1.8 0 2.8-1 2.8-2.5s-1-2.5-2.8-2.5H7.5v5z" fill="#002970" />
    <path d="M23.5 15.5c0 1.5-.8 2.5-2.2 2.5-1.2 0-1.8-.7-1.8-1.8 0-1.5 1.2-2.2 3-2.4l1-.1v1.8zm0-3.2c-2 0-5.5.5-5.5 3.8 0 2.5 1.8 3.8 3.8 3.8 1.8 0 3-.8 3.6-1.8V20h3.2v-8c0-3-2-4.2-4.8-4.2-2.8 0-4.5 1.4-4.8 3.2l2.8.6c.2-.8 1-1.4 2.2-1.4 1.4 0 2.2.8 2.2 2v.8h-2.7z" fill="#002970" />
    <path d="M30.5 8l3.2 8.5 3.2-8.5h3.6l-5.2 12.5c-1.2 3-2.8 4.2-5.5 4.2-.8 0-1.8-.2-2.2-.4l.8-2.5c.3.2 1 .3 1.5.3 1.4 0 2.2-.7 2.8-2.2l.4-.9-4.8-11h3.6v-.5z" fill="#002970" />
    {/* 'tm' in Bright Cyan #00BAF2 */}
    <path d="M44.5 4.5h7.2V7H48v13h-3.2V7h-2.8V4.5z" fill="#00BAF2" />
    <path d="M53.5 8h3v1.8c.8-1.3 2.2-2 3.8-2 1.8 0 3 .8 3.6 2.1.8-1.3 2.2-2.1 3.8-2.1 2.8 0 4.2 1.8 4.2 4.8V20h-3.2v-6.8c0-1.5-.6-2.2-1.8-2.2-1.2 0-2 .8-2 2.4V20h-3.2v-6.8c0-1.5-.6-2.2-1.8-2.2-1.2 0-2 .8-2 2.4V20h-3.2V8z" fill="#00BAF2" />
  </svg>
);

const VisaLogo: React.FC<{ className?: string }> = ({ className = 'h-3.5 w-auto' }) => (
  <svg className={className} viewBox="0 0 36 12" fill="none">
    <path d="M14.5 1.1l-3.2 9.8h-2.1L6.6 3.1c-.2-.8-.4-1.1-1.1-1.4C4.3 1.3 2.8 1 1.4 0.7L1.6 0.2h5.3c.7 0 1.3.5 1.5 1.3l1.3 6.9 3.2-8.2h2.2zm8.3 6.5c0-2.5-3.5-2.7-3.5-3.8 0-1.2 1.3-1.2 1.7-1.2 1 0 2 .2 2.6.6l.4-2.1c-.6-.3-1.6-.4-2.8-.4-3 0-5.1 1.6-5.1 3.8 0 3.3 4.6 2.8 4.6 4.6 0 1.3-1.6 1.4-2.3 1.4-1.4 0-2.5-.4-3.3-.7l-.4 2.2c.8.4 2.2.6 3.8.6 3.5 0 5.7-1.7 5.7-3.9v-.5zm7.8 3.3h2.1l-1.8-9.8h-2c-.4 0-.9.3-1 .7l-3.7 9.1h2.3l.5-1.3h3l.6 1.3zm-2.6-3.1l1.3-3.6.7 3.6h-2zm-10.7 3.1l2-9.8h-2.2l-2 9.8h2.2z" fill="#1A1F71" />
  </svg>
);

const MastercardLogo: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <svg className={className} viewBox="0 0 36 22" fill="none">
    <circle cx="12" cy="11" r="9" fill="#EB001B" />
    <circle cx="24" cy="11" r="9" fill="#F79E1B" fillOpacity="0.88" />
  </svg>
);

const RuPayLogo: React.FC<{ className?: string }> = ({ className = 'h-3 w-auto' }) => (
  <svg className={className} viewBox="0 0 60 14" fill="none">
    <text x="0" y="12" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="900" fontStyle="italic" fill="#005B9F">RuPay</text>
    <path d="M50 1l3 5-3 5h3l3-5-3-5h-3z" fill="#F47920" />
    <path d="M45 1l3 5-3 5h3l3-5-3-5h-3z" fill="#00A551" />
  </svg>
);

const UpiBadge: React.FC<{ className?: string }> = ({ className = 'h-4 w-auto' }) => (
  <svg className={className} viewBox="0 0 54 20" fill="none">
    <rect width="54" height="20" rx="4" fill="#097939" fillOpacity="0.1" />
    <path d="M40 3l-4 7h4l-2 7 8-7h-4l2-7z" fill="#097939" />
    <text x="6" y="15" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="900" fontStyle="italic" fill="#097939">UPI</text>
  </svg>
);

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

export default function CheckoutPage() {
  const router = useRouter();

  // Cart & Billing State
  const cartItems = useCartStore((state) => state.items);
  const billingScanned = useBillingStore((state) => state.scannedItems);
  const updateScannedItemQuantity = useBillingStore((state) => state.updateScannedItemQuantity);
  const removeScannedItem = useBillingStore((state) => state.removeScannedItem);
  const resetBilling = useBillingStore((state) => state.resetBilling);
  const authPhone = useAuthStore((state) => state.phone);
  const clearCart = useCartStore((state) => state.clearCart);

  // Active items: Use scanned items from trolley, or fallback to cart items
  const activeItems = billingScanned.length > 0 ? billingScanned : cartItems.map((c) => ({
    ...c,
    subtotal: c.price * c.quantity,
    scannedAt: Date.now(),
  }));

  // Customer Contact State — Instant 0ms Hydration from localStorage/Auth
  const [customerName, setCustomerName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('martverse_customer_name');
        if (saved) return saved;
        const userRaw = localStorage.getItem('martverse_user');
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u.name || u.fullName) return u.name || u.fullName;
        }
      } catch {}
    }
    return '';
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('martverse_phone');
      if (p) return p;
    }
    return authPhone || '';
  });

  // Address Management State — Instant 0ms Hydration from localStorage
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
        const valid = (Array.isArray(raw) ? raw : []).filter(
          (a: SavedAddress) => a.id !== 'addr-1' && a.id !== 'addr-2'
        );
        return valid;
      } catch {}
    }
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
        const valid = (Array.isArray(raw) ? raw : []).filter(
          (a: SavedAddress) => a.id !== 'addr-1' && a.id !== 'addr-2'
        );
        if (valid.length > 0) {
          const def = valid.find((a: SavedAddress) => a.isDefault) || valid[0];
          return def.id;
        }
      } catch {}
    }
    return '';
  });
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

  // Payment Selection State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'PAYTM' | 'GPAY' | null>(null);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing & Success State
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const orderJustCompleted = React.useRef(false);

  // Rating & Feedback State
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['⚡ Fast Checkout', '🛒 3D Supermarket']);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Whenever user has active items in trolley, this is a NEW order!
  // Always clear any previous completed order so checkout view displays immediately
  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/orders');
    if (activeItems.length > 0) {
      setCompletedOrder(null);
      orderJustCompleted.current = false;
    }
  }, [activeItems.length, router]);

  // Unified Store Navigation Handlers
  const handleBackToStore = () => {
    setCompletedOrder(null);
    orderJustCompleted.current = false;
    resetBilling();
    martRuntime.billingCooldownUntil = Date.now() + 2500;
    // Back to Store: Return directly to Billing Section in front of Lane 02 ([0, 1.5, 14.6])
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = 14.6;
    martRuntime.playerYaw = 0;
    useMartStore.getState().setHasEnteredStore(true);
    useMartStore.getState().setPlayerPos([0, 1.5, 14.6], 0);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('martverse_entered', 'true');
      sessionStorage.setItem('martverse_skip_intro', 'true');
      sessionStorage.setItem('martverse_return_target', 'billing');
      localStorage.setItem('martverse_entered', 'true');
      localStorage.setItem('martverse_intro_completed', 'true');
      localStorage.setItem('martverse_skip_intro', 'true');
    }
    router.replace('/?return=billing');
  };

  const handleContinueShopping = () => {
    setCompletedOrder(null);
    orderJustCompleted.current = false;
    resetBilling();
    clearCart();
    martRuntime.billingCooldownUntil = Date.now() + 2500;
    // Continue Shopping: Return to Trolley Reset Place in mart ([0, 1.5, -20]) with a fresh empty trolley
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = -20;
    martRuntime.playerYaw = 0;
    useMartStore.getState().setHasEnteredStore(true);
    useMartStore.getState().setPlayerPos([0, 1.5, -20], 0);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('martverse_entered', 'true');
      sessionStorage.setItem('martverse_skip_intro', 'true');
      sessionStorage.setItem('martverse_return_target', 'trolley_reset');
      localStorage.setItem('martverse_entered', 'true');
      localStorage.setItem('martverse_intro_completed', 'true');
      localStorage.setItem('martverse_skip_intro', 'true');
    }
    router.replace('/?return=trolley_reset');
  };

  const handleViewInOrders = () => {
    setCompletedOrder(null);
    orderJustCompleted.current = false;
    resetBilling();
    clearCart();
    router.push('/orders');
  };

  const feedbackTagOptions = [
    '⚡ Fast Checkout',
    '🛒 3D Supermarket',
    '📦 Fresh Packaging',
    '💳 Seamless Payment',
    '📍 Accurate Address',
    '🛍️ Great Discounts',
  ];

  // Auto-fill auth phone if available
  useEffect(() => {
    if (authPhone) {
      setCustomerPhone(authPhone);
    }
  }, [authPhone]);

  // Background sync for addresses from backend database
  useEffect(() => {
    let isMounted = true;
    const fetchAddresses = async () => {
      try {
        const list = await api.getAddresses(customerPhone);
        if (isMounted && Array.isArray(list)) {
          const valid = list.filter(
            (a: SavedAddress) => a.id !== 'addr-1' && a.id !== 'addr-2'
          );
          if (valid.length > 0) {
            setSavedAddresses(valid);
            setSelectedAddressId((curr) => {
              if (curr && valid.some((a) => a.id === curr)) return curr;
              const def = valid.find((a: SavedAddress) => a.isDefault) || valid[0];
              return def.id;
            });
          }
        }
      } catch {}
    };
    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [customerPhone]);

  // Trigger celebration confetti on payment completion
  useEffect(() => {
    if (completedOrder) {
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  }, [completedOrder]);

  // --- Exact Mathematical Calculations ---
  const codFee = selectedPaymentMethod === 'CASH' ? 20 : 0;
  const itemsSubtotal = activeItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const mrpTotal = activeItems.reduce((acc, it) => acc + (it.mrp || Math.round(it.price * 1.22)) * it.quantity, 0);
  const savingsOnMrp = Math.max(0, mrpTotal - itemsSubtotal);
  const deliveryCharge = itemsSubtotal >= 499 || itemsSubtotal === 0 ? 0 : 40;
  const totalPayable = itemsSubtotal + deliveryCharge + codFee;
  const gstInclusive = (itemsSubtotal * 0.05).toFixed(2);

  const activeSelectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) ||
    (savedAddresses.length > 0 ? savedAddresses[0] : null);

  // --- Strict Validation ---
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
    if (!selectedPaymentMethod) return false;
    if (selectedPaymentMethod === 'UPI') return Boolean(selectedUpiApp);
    if (selectedPaymentMethod === 'CARD') {
      const rawCard = cardNumber.replace(/\s/g, '');
      return (
        rawCard.length >= 15 &&
        cardExpiry.trim().length >= 4 &&
        cardCvv.trim().length >= 3 &&
        cardHolder.trim().length > 0
      );
    }
    if (selectedPaymentMethod === 'CASH') return true;
    return false;
  })();

  const isFormValid = isAddressValid && isCustomerValid && isPaymentValid && activeItems.length > 0;

  const validationPrompt = (() => {
    if (activeItems.length === 0) return 'Shopping trolley is empty. Please add items to proceed.';
    if (isAddingNewAddress) return 'Please save your delivery address details above';
    if (!isAddressValid) return 'Please add and select a delivery address';
    if (!customerName.trim()) return 'Please enter your Full Name in Section 2';
    if (customerPhone.replace(/\D/g, '').length !== 10) return 'Please enter a valid 10-digit Mobile Number';
    if (!selectedPaymentMethod) return 'Please select a payment method (UPI, Card, or COD)';
    if (selectedPaymentMethod === 'UPI' && !selectedUpiApp) return 'Please choose PhonePe, Paytm, or Google Pay';
    if (selectedPaymentMethod === 'CARD' && !isPaymentValid) return 'Please complete card number, expiry date, and CVV';
    return null;
  })();

  // --- GPS Autofill ---
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setIsAddingNewAddress(true);
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

  // --- Save New Address ---
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.houseNo.trim()) {
      setFormError('House / Flat details are required.');
      return;
    }
    if (!newAddress.area.trim()) {
      setFormError('Street / Locality details are required.');
      return;
    }
    if (!newAddress.city.trim() || !newAddress.pinCode.trim() || newAddress.pinCode.trim().length < 6) {
      setFormError('City and valid 6-digit Pincode are required.');
      return;
    }

    const houseNoTrimmed = newAddress.houseNo.trim();
    const areaTrimmed = newAddress.area.trim();
    const pinCodeTrimmed = newAddress.pinCode.trim();

    const existingIndex = savedAddresses.findIndex(
      (a) =>
        a.houseNo?.trim().toLowerCase() === houseNoTrimmed.toLowerCase() &&
        a.area?.trim().toLowerCase() === areaTrimmed.toLowerCase() &&
        a.pinCode?.trim() === pinCodeTrimmed
    );

    const shouldBeDefault = newAddress.setAsDefault || savedAddresses.length === 0;

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

  // --- Set Default Address ---
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

  // --- Delete Address ---
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

  // --- Proceed to Pay ---
  const handleProceedToPay = async () => {
    if (!isFormValid || isProcessing || !selectedPaymentMethod) return;
    setFormError(null);
    setIsProcessing(true);

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
        items: activeItems.map((it) => ({
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

      // Clear trolley
      clearCart();
      resetBilling();

      // Show success screen
      orderJustCompleted.current = true;
      setCompletedOrder({
        ...orderRes,
        finalAmount: totalPayable,
        paymentMethod: selectedPaymentMethod,
        paymentProvider: paymentProviderName,
      });
    } catch (err) {
      console.error('Checkout failed:', err);
      setFormError('Checkout processing encountered an issue. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==============================================================
  // VIEW: MAIN STANDALONE CHECKOUT PAGE (Fully Scrollable & Polished)
  // ==============================================================
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white pb-24 overflow-x-hidden overflow-y-auto relative">
      {/* Ambient soft light blue luxury backdrop glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-sky-50/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ============================================================== */}
      {/* POPUP: ORDER SUCCESS CONFIRMATION MODAL OVERLAY                */}
      {/* Soft glass blur on top of checkout page — NO pitch black backdrop */}
      {/* ============================================================== */}
      {completedOrder && orderJustCompleted.current && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-[440px] w-full bg-white rounded-3xl border border-sky-100 shadow-[0_25px_70px_rgba(2,132,199,0.22)] p-5 sm:p-6 text-center space-y-4 relative overflow-hidden my-auto animate-framer-spring">
            {/* Top Success Badge */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-sky-400/25 rounded-2xl blur-lg animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-600" />
                Order Confirmed &amp; Verified
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Order Placed Successfully!
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">
                Order Reference: <strong className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded font-mono">{completedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Amount Paid & Delivery Information Card */}
            <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 text-left space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 text-xs">
                <span className="text-slate-600 font-bold">Total Paid:</span>
                <span className="font-mono font-black text-base text-slate-900">
                  ₹{completedOrder.finalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Payment Mode:</span>
                <span className="font-bold text-slate-800">{completedOrder.paymentProvider}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Estimated Delivery:</span>
                <span className="font-bold text-sky-700 flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  <Truck className="w-3 h-3 text-sky-600" />
                  Within 30 Mins (Express Dispatch)
                </span>
              </div>
            </div>

            {/* Customer Rating Section */}
            <div className="bg-gradient-to-br from-sky-50/50 via-slate-50 to-blue-50/30 rounded-2xl p-3 border border-sky-100/90 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-800 block">Rate Your Supermarket Experience</span>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(null)}
                    onClick={() => setStarRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverStar || starRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Tag feedback chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                {feedbackTagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Highly Clickable & Distinct Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleViewInOrders}
                className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 hover:text-slate-950 font-black text-xs transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-slate-200/90 group"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-600 group-hover:scale-110 transition-transform" />
                <span>View in Orders</span>
              </button>
              <button
                type="button"
                onClick={handleContinueShopping}
                className="py-3 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:via-blue-500 hover:to-sky-400 text-white font-black text-xs transition-all duration-200 cursor-pointer shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-sky-400/40 group overflow-hidden relative"
              >
                <Store className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Ambient soft light blue luxury backdrop glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-sky-50/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-sky-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* --- Top Glassy Luxury White Executive Header --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-8 py-3.5 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={handleBackToStore}
            className="flex items-center gap-3.5 cursor-pointer group"
            title="Return to Billing Section"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 border border-white/60 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm sm:text-base tracking-tight font-black uppercase text-slate-900 font-sans group-hover:text-sky-600 transition-colors">
                  MART<span className="text-sky-600">VERSE</span> EXPRESS CHECKOUT
                </h1>
                <span className="text-[10px] bg-sky-50 border border-sky-200/90 text-sky-700 font-black px-2.5 py-0.5 rounded-full font-mono shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  LANE 02
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                Official In-Store Express Checkout &amp; Instant Invoice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToStore}
            title="Return to Billing Section"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-50 to-white hover:from-sky-100 hover:to-sky-50 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 border border-sky-200/80 hover:border-sky-300 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>Back to Store</span>
          </button>
        </div>
      </header>

      {/* Sub-header Checkout Stepper Navigation */}
      <div className="bg-white/90 border-b border-slate-200/80 py-3 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto select-none">
            {/* Step 1 */}
            <span className="flex items-center gap-1.5 text-sky-800 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3]" />
              <span>1. Trolley Items</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            {/* Step 2 */}
            <span className="flex items-center gap-1.5 text-sky-900 font-extrabold bg-gradient-to-r from-sky-50 to-white px-3 py-1 rounded-full border border-sky-300 shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span>2. Delivery & Payment</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            {/* Step 3 */}
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold px-2 py-1">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <span>3. Order Placed</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 text-sky-800 font-bold bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-200/80">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              100% Purchase Protection
            </span>
            <span className="flex items-center gap-1.5 text-sky-800 font-bold bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-200/80">
              <Clock className="w-4 h-4 text-sky-600" />
              Express 30-Min Delivery
            </span>
          </div>
        </div>
      </div>

      {/* --- Main Two-Column Layout --- */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Delivery Address + Contact + Payment Method      */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. DELIVERY ADDRESS SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.08)] hover:border-sky-200 transition-all duration-300 p-6 sm:p-7 space-y-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-sky-300 before:via-sky-100 before:to-transparent">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-white text-sky-900 border border-sky-200/90 flex items-center justify-center font-black text-sm shadow-xs transition-transform duration-200 hover:scale-105">
                    1
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                      1. Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Where should we deliver your order?
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
                    className="text-xs font-bold text-sky-800 bg-gradient-to-r from-sky-50 to-white hover:from-sky-100 hover:to-sky-50 px-3.5 py-1.5 rounded-xl border border-sky-200/90 hover:border-sky-300 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 group"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5] text-sky-600 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {/* View A: Saved Addresses Grid */}
              {!isAddingNewAddress && savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const TypeIcon = addr.type === 'HOME' ? Home : addr.type === 'WORK' ? Building : MapPin;

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative active:scale-[0.99] ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-50/90 via-sky-50/40 to-white border-2 border-sky-400 shadow-md shadow-sky-500/10'
                            : 'bg-white border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/20 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? 'border-sky-500 bg-sky-500 text-white shadow-xs' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-3xs">
                              <TypeIcon className="w-3.5 h-3.5 text-slate-500" />
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 shadow-3xs tracking-wide">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => handleSetDefaultAddress(addr.id, e)}
                                className="text-[11px] text-sky-600 hover:text-sky-800 font-bold cursor-pointer hover:underline px-1 py-0.5"
                                title="Set as default address"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer active:scale-90"
                              title="Delete this address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3.5 pl-7.5 space-y-1">
                          <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                            {addr.houseNo}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                            {addr.area}
                            {addr.landmark ? `, Near ${addr.landmark}` : ''}
                          </p>
                          <p className="text-[11px] font-mono font-bold text-slate-800 pt-0.5">
                            {addr.city} — {addr.pinCode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View B: Modern Empty State */}
              {!isAddingNewAddress && savedAddresses.length === 0 && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50/50 to-indigo-50/40 border border-blue-100 text-center space-y-3.5 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Compass className="w-6 h-6 stroke-[2.2] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">Where should we deliver your groceries?</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add your home or office address to enable express delivery within 30 minutes.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use Current GPS Location'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(true);
                        setFormError(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>Enter Address Manually</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View C: Add Address Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-1 animate-in fade-in duration-200">
                  {/* GPS Autofill Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-blue-50/80 border border-blue-200/90 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-950 block">Auto-detect Location</span>
                        <span className="text-[11px] text-blue-700">Fill address details instantly using device GPS</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                    >
                      {isLocating ? 'Detecting GPS...' : 'Use Current Location'}
                    </button>
                  </div>

                  {locationSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{locationSuccessMsg}</span>
                    </div>
                  )}

                  {/* Address Type Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Save as:</span>
                    <div className="flex items-center gap-2">
                      {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewAddress((prev) => ({ ...prev, type }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            newAddress.type === type
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {type === 'HOME' && <Home className="w-3.5 h-3.5" />}
                          {type === 'WORK' && <Building className="w-3.5 h-3.5" />}
                          {type === 'OTHER' && <MapPin className="w-3.5 h-3.5" />}
                          <span>{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Flat / House No. / Building <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.houseNo}
                        onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                        placeholder="e.g. Tower B, Flat 402, Green Meadows"
                        className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Area / Street / Sector <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.area}
                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                        placeholder="e.g. 12th Main Road, Indiranagar"
                        className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        placeholder="e.g. Near Metro Station & BDA Complex"
                        className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Pincode (6 digits) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g. 560038"
                        className="w-full bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(false);
                        setFormError(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
                    >
                      Save & Deliver Here
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. CUSTOMER CONTACT DETAILS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.08)] hover:border-sky-200 transition-all duration-300 p-6 sm:p-7 space-y-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-sky-300 before:via-sky-100 before:to-transparent">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-white text-sky-900 border border-sky-200/90 flex items-center justify-center font-black text-sm shadow-xs transition-transform duration-200 hover:scale-105">
                    2
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                      2. Customer Contact
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      For instant order invoice &amp; live GPS delivery updates
                    </p>
                  </div>
                </div>
                {isCustomerValid ? (
                  <span className="text-[10px] text-sky-800 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80 flex items-center gap-1.5 shadow-2xs tracking-wide">
                    <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3]" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    Required
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerName(val);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('martverse_customer_name', val);
                        }
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none"
                    />
                    <User className="w-4 h-4 text-sky-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-mono font-black text-slate-700 bg-slate-200/70 border border-slate-300/80 px-2 py-0.5 rounded-md pointer-events-none select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setCustomerPhone(val);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('martverse_phone', val);
                        }
                      }}
                      placeholder="9876543210"
                      className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 rounded-2xl pl-16 pr-10 py-3 text-xs sm:text-sm font-bold text-slate-900 transition-all outline-none font-mono tracking-wider"
                    />
                    {customerPhone.length === 10 ? (
                      <span className="absolute right-3.5 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3]" />
                      </span>
                    ) : (
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3.5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PAYMENT METHOD SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.08)] hover:border-sky-200 transition-all duration-300 p-6 sm:p-7 space-y-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-sky-300 before:via-sky-100 before:to-transparent">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-white text-sky-900 border border-sky-200/90 flex items-center justify-center font-black text-sm shadow-xs transition-transform duration-200 hover:scale-105">
                    3
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                      3. Payment Method
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Choose how you want to pay</p>
                  </div>
                </div>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80 flex items-center gap-1.5 shadow-2xs tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  100% Encrypted &amp; Safe
                </span>
              </div>

              {/* 3 Payment Options in ONE Row */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: UPI */}
                  <div
                    onClick={() => {
                      setSelectedPaymentMethod('UPI');
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none active:scale-[0.99] ${
                      selectedPaymentMethod === 'UPI'
                        ? 'bg-white border-2 border-[#00AEEF] shadow-sm shadow-sky-500/10 ring-2 ring-sky-100'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE]/70 border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                        <QrCode className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedPaymentMethod === 'UPI'
                            ? 'border-[#00AEEF] bg-[#00AEEF] text-white shadow-xs'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedPaymentMethod === 'UPI' && (
                          <Check className="w-3 h-3 stroke-[3] text-white" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">UPI Instant</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                          ⚡ Free
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                        PhonePe, GPay, Paytm
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Credit / Debit Card */}
                  <div
                    onClick={() => setSelectedPaymentMethod('CARD')}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none active:scale-[0.99] ${
                      selectedPaymentMethod === 'CARD'
                        ? 'bg-white border-2 border-[#00AEEF] shadow-sm shadow-sky-500/10 ring-2 ring-sky-100'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE]/70 border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                        <CreditCard className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedPaymentMethod === 'CARD'
                            ? 'border-[#00AEEF] bg-[#00AEEF] text-white shadow-xs'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedPaymentMethod === 'CARD' && (
                          <Check className="w-3 h-3 stroke-[3] text-white" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">Cards</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                          Visa / MC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                        Credit / Debit Card
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Cash on Delivery */}
                  <div
                    onClick={() => setSelectedPaymentMethod('CASH')}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none active:scale-[0.99] ${
                      selectedPaymentMethod === 'CASH'
                        ? 'bg-white border-2 border-[#00AEEF] shadow-sm shadow-sky-500/10 ring-2 ring-sky-100'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE]/70 border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
                        <Banknote className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedPaymentMethod === 'CASH'
                            ? 'border-[#00AEEF] bg-[#00AEEF] text-white shadow-xs'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedPaymentMethod === 'CASH' && (
                          <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">Cash / QR</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]">
                          +₹20
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
                        Pay upon delivery
                      </p>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------ */}
                {/* When UPI is tapped: Show Below the 3 UPI Options */}
                {/* ------------------------------------------------------------ */}
                {selectedPaymentMethod === 'UPI' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-[0_2px_12px_rgba(2,132,199,0.04)] space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Select your preferred UPI App:
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Fast 1-click verification</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('PHONEPE');
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                          selectedUpiApp === 'PHONEPE'
                            ? 'bg-sky-50/40 border-2 border-[#00AEEF] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-7 flex items-center justify-center">
                          <PhonePeIcon className="h-6 w-auto" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">PhonePe</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedUpiApp === 'PHONEPE' ? 'border-[#00AEEF] bg-[#00AEEF]' : 'border-slate-300 bg-white'}`}>
                          {selectedUpiApp === 'PHONEPE' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Google Pay */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('GPAY');
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                          selectedUpiApp === 'GPAY'
                            ? 'bg-sky-50/40 border-2 border-[#00AEEF] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-7 flex items-center justify-center">
                          <GooglePayIcon className="h-4.5 w-auto" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Google Pay</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedUpiApp === 'GPAY' ? 'border-[#00AEEF] bg-[#00AEEF]' : 'border-slate-300 bg-white'}`}>
                          {selectedUpiApp === 'GPAY' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpiApp('PAYTM');
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                          selectedUpiApp === 'PAYTM'
                            ? 'bg-sky-50/40 border-2 border-[#00AEEF] shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-7 flex items-center justify-center">
                          <PaytmIcon className="h-4.5 w-auto" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Paytm</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedUpiApp === 'PAYTM' ? 'border-[#00AEEF] bg-[#00AEEF]' : 'border-slate-300 bg-white'}`}>
                          {selectedUpiApp === 'PAYTM' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* When Card is tapped: Show Below the Card Form */}
                {/* ------------------------------------------------------------ */}
                {selectedPaymentMethod === 'CARD' && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#BAE6FD] shadow-[0_2px_12px_rgba(2,132,199,0.04)] space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Card Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardNumber(val);
                            }}
                            placeholder="4532 8920 1204 8821"
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:border-[#00AEEF] focus:ring-4 focus:ring-sky-100 outline-none transition-all shadow-xs"
                          />
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Name on Card <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="MOHAN NERASALA"
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 uppercase placeholder:text-slate-400 focus:border-[#00AEEF] focus:ring-4 focus:ring-sky-100 outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Expiry Date (MM/YY) <span className="text-rose-500">*</span>
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
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-800 text-center placeholder:text-slate-400 focus:border-[#00AEEF] focus:ring-4 focus:ring-sky-100 outline-none transition-all shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          CVV (3 Digits) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="•••"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-800 text-center tracking-widest placeholder:text-slate-400 focus:border-[#00AEEF] focus:ring-4 focus:ring-sky-100 outline-none transition-all shadow-xs"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      <span>Protected with 256-bit bank-grade encryption. CVV is never stored.</span>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* When Cash on Delivery is tapped: Show Below the Cash Note */}
                {/* ------------------------------------------------------------ */}
                {selectedPaymentMethod === 'CASH' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-[0_2px_12px_rgba(2,132,199,0.04)] space-y-1.5 animate-in fade-in duration-200 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Banknote className="w-4 h-4 text-[#0284C7]" />
                      <span>Cash on Delivery Confirmed (+₹20 added to bill)</span>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Please keep exact cash ready (₹{totalPayable.toLocaleString('en-IN')}) upon arrival, or pay instantly using delivery agent&apos;s UPI QR code.
                    </p>
                  </div>
                )}
              </div>

              {/* Guidance message when no payment method is chosen */}
              {!selectedPaymentMethod && (
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    Please click UPI, Card, or Cash on Delivery above to select your payment mode
                  </p>
                </div>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Scanned Items + Live Bill Calculations + Pay Button */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* Scanned Items Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.08)] hover:border-sky-200 transition-all duration-300 p-6 sm:p-7 space-y-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-sky-300 before:via-sky-100 before:to-transparent">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-100 to-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/80 shadow-xs">
                    <Barcode className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    Scanned Items ({activeItems.length})
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200/80 shadow-3xs">
                  {activeItems.reduce((acc, it) => acc + it.quantity, 0)} units
                </span>
              </div>

              {/* Scrollable Scanned Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
                {activeItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-600 font-bold">Your trolley is empty.</p>
                    <button
                      type="button"
                      onClick={handleBackToStore}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return to Entrance (Reset Trolley)</span>
                    </button>
                  </div>
                ) : (
                  activeItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center p-1.5 flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
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
                          <span className="font-black text-slate-900 truncate block text-xs sm:text-sm" title={item.productName}>
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono font-semibold">
                            ₹{item.price} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shadow-inner">
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity - 1)}
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-700 bg-white hover:bg-slate-50 hover:text-black shadow-2xs transition-all cursor-pointer active:scale-90 font-bold"
                          >
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center font-mono font-black text-slate-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateScannedItemQuantity(item.id, item.quantity + 1)}
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-700 bg-white hover:bg-slate-50 hover:text-black shadow-2xs transition-all cursor-pointer active:scale-90 font-bold"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>

                        <span className="font-mono font-black text-slate-900 text-xs sm:text-sm w-16 text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeScannedItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition-all cursor-pointer active:scale-90"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Order Summary & Calculations */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.08)] hover:border-sky-200 transition-all duration-300 p-6 sm:p-7 space-y-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-sky-300 before:via-sky-100 before:to-transparent">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-100 to-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/80 shadow-xs">
                    <Receipt className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    Order Summary
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80 tracking-wide">
                  Exact Calculation
                </span>
              </div>

              {/* Itemized Calculation Summary */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Items Subtotal:</span>
                  <span className="text-slate-900 font-bold font-mono">
                    ₹{itemsSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {savingsOnMrp > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Savings on MRP:</span>
                    <span className="font-mono text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-3xs">
                      - ₹{savingsOnMrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Delivery Charges:</span>
                  <span className="font-bold text-slate-900">
                    {deliveryCharge === 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-slate-400 text-xs">₹40</span>
                        <span className="text-sky-800 bg-sky-50 border border-sky-200 font-bold text-[10px] px-2.5 py-0.5 rounded-lg shadow-3xs tracking-wide">
                          FREE DELIVERY
                        </span>
                      </span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px] sm:text-xs">
                  <span>Taxes (GST 5% Included in MRP):</span>
                  <span className="font-mono text-slate-600 font-semibold">₹{gstInclusive} (Included)</span>
                </div>

                {/* COD Handling Fee */}
                {selectedPaymentMethod === 'CASH' && (
                  <div className="flex justify-between text-amber-900 bg-amber-50 px-3.5 py-2.5 rounded-2xl border border-amber-200 font-bold text-xs animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      COD Verification Fee:
                    </span>
                    <span className="font-mono">+ ₹20</span>
                  </div>
                )}

                {/* Grand Total Luxury Box */}
                <div className="mt-2 p-4.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white shadow-xl shadow-slate-950/15 flex items-baseline justify-between border border-slate-800">
                  <div>
                    <span className="text-xs font-black text-slate-200 block leading-tight uppercase tracking-wider">
                      TOTAL PAYABLE AMOUNT
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {selectedPaymentMethod === 'CASH' ? 'Includes ₹20 COD fee' : 'Inclusive of all applicable taxes'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Validation Warning Notice Banner */}
              {!isFormValid && validationPrompt && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2.5 shadow-2xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{validationPrompt}</span>
                </div>
              )}

              {/* Primary Action Pay Button */}
              <button
                type="button"
                onClick={handleProceedToPay}
                disabled={!isFormValid || isProcessing}
                className={`w-full py-4.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 select-none relative overflow-hidden group ${
                  isFormValid && !isProcessing
                    ? 'bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:via-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 hover:-translate-y-0.5 cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-75 shadow-none'
                }`}
              >
                {/* Sweeping Light Gleam */}
                {isFormValid && !isProcessing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                )}

                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Express Payment...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span>
                      {!isAddressValid
                        ? 'Add Delivery Address to Pay'
                        : !isCustomerValid
                        ? 'Enter Customer Contact to Pay'
                        : !selectedPaymentMethod
                        ? `Select Payment Method (₹${totalPayable.toLocaleString('en-IN')})`
                        : selectedPaymentMethod === 'UPI' && !selectedUpiApp
                        ? 'Choose PhonePe, Paytm, or Google Pay'
                        : selectedPaymentMethod === 'CASH'
                        ? `Place COD Order • ₹${totalPayable.toLocaleString('en-IN')}`
                        : `Pay ₹${totalPayable.toLocaleString('en-IN')} Now`}
                    </span>
                  </>
                )}
              </button>

              {/* Security and Trust Badges */}
              <div className="pt-1 grid grid-cols-3 gap-2.5 text-center text-[11px] text-slate-500">
                <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col items-center gap-1.5 shadow-3xs hover:shadow-xs transition-all">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 leading-tight">100% Genuine</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col items-center gap-1.5 shadow-3xs hover:shadow-xs transition-all">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 leading-tight">256-Bit SSL</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col items-center gap-1.5 shadow-3xs hover:shadow-xs transition-all">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800 leading-tight">Instant Refund</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
