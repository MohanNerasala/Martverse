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

// --- Real Authentic SVGs for Payment Providers (Official Logos & Icons) ---
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
    {/* Authentic Official Devanagari 'पे' (Pe) Glyph in Crisp White */}
    <g fill="#FFFFFF">
      {/* Shirorekha (Top Horizontal Headline) */}
      <rect x="9.5" y="11.5" width="20" height="3.2" rx="1" />
      {/* Vertical Main Stem */}
      <rect x="22.2" y="11.5" width="3.4" height="19.5" rx="1" />
      {/* 'प' Left Loop */}
      <path d="M13.5 14v6.2c0 3.8 2.8 6.5 6.6 6.5h2.1V23.5h-2c-2 0-3.3-1.3-3.3-3.3V14h-3.4z" />
      {/* 'े' (Matra) Top Slanted Loop */}
      <path d="M22.5 12.2c-.8-2.6-2.5-4.6-4.8-5.4-1.8-.6-3.2-.2-3.8.9-.6 1.1-.3 2.5 1 3.5 1.4 1.1 3.2 1.4 4.8 1.4l2.8-.4zm-3-2.6c-.7-.5-.9-1.2-.6-1.7.3-.5.9-.6 1.8-.3 1.2.4 2.2 1.5 2.6 2.8-1.5 0-2.8-.2-3.8-.8z" />
    </g>
  </svg>
);

const PaytmIcon: React.FC<{ className?: string }> = ({ className = 'h-5.5 w-auto' }) => (
  <svg className={className} viewBox="0 0 82 22" fill="none">
    {/* Authentic Paytm Wordmark: Navy 'Pay' + Cyan 'tm' */}
    <path d="M4 3.5h5.5c3.5 0 6 2.2 6 5.5s-2.5 5.5-6 5.5H7.5V20H4V3.5zm3.5 8h1.8c1.8 0 2.8-1 2.8-2.5s-1-2.5-2.8-2.5H7.5v5z" fill="#002970" />
    <path d="M23.5 15.5c0 1.5-.8 2.5-2.2 2.5-1.2 0-1.8-.7-1.8-1.8 0-1.5 1.2-2.2 3-2.4l1-.1v1.8zm0-3.2c-2 0-5.5.5-5.5 3.8 0 2.5 1.8 3.8 3.8 3.8 1.8 0 3-.8 3.6-1.8V20h3.2v-8c0-3-2-4.2-4.8-4.2-2.8 0-4.5 1.4-4.8 3.2l2.8.6c.2-.8 1-1.4 2.2-1.4 1.4 0 2.2.8 2.2 2v.8h-2.7z" fill="#002970" />
    <path d="M30.5 8l3.2 8.5 3.2-8.5h3.6l-5.2 12.5c-1.2 3-2.8 4.2-5.5 4.2-.8 0-1.8-.2-2.2-.4l.8-2.5c.3.2 1 .3 1.5.3 1.4 0 2.2-.7 2.8-2.2l.4-.9-4.8-11h3.6v-.5z" fill="#002970" />
    {/* tm in #00BAF2 */}
    <path d="M44.5 4.5h7.2V7H48v13h-3.2V7h-2.8V4.5z" fill="#00BAF2" />
    <path d="M53.5 8h3v1.8c.8-1.3 2.2-2 3.8-2 1.8 0 3 .8 3.6 2.1.8-1.3 2.2-2.1 3.8-2.1 2.8 0 4.2 1.8 4.2 4.8V20h-3.2v-6.8c0-1.5-.6-2.2-1.8-2.2-1.2 0-2 .8-2 2.4V20h-3.2v-6.8c0-1.5-.6-2.2-1.8-2.2-1.2 0-2 .8-2 2.4V20h-3.2V8z" fill="#00BAF2" />
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

  // Customer Contact State — Instant 0ms Hydration
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

  // Payment State: UPI (PhonePe, Paytm, GPay - Icons Only), Card, Cash on Delivery (+₹20) (Clean Start: Unselected)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH' | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PHONEPE' | 'PAYTM' | 'GPAY' | null>(null);

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

  // When billing enters review phase, automatically route directly to dedicated separate /checkout page
  useEffect(() => {
    if (phase === 'review' || phase === 'checkout_details' || phase === 'payment_methods') {
      useBillingStore.getState().resetBilling();
      router.push('/checkout');
    }
  }, [phase, router]);

  // Background sync for saved addresses from backend database
  useEffect(() => {
    let isMounted = true;
    const fetchSavedAddresses = async () => {
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
    fetchSavedAddresses();
    return () => {
      isMounted = false;
    };
  }, [customerPhone]);


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
    if (!selectedPaymentMethod) return false;
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
    if (!selectedPaymentMethod) return 'Please choose a payment method (UPI, Card, or COD)';
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
    martRuntime.billingCooldownUntil = Date.now() + 20000;
    setPlayerPos([0, 1.5, 12.0], Math.PI);
  };

  // --- Proceed to Payment & Trigger Real Backend / Local Storage Persistence ---
  const handleProceedToPay = async () => {
    if (!isFormValid || isButtonDisabled || !selectedPaymentMethod) return;
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
    resetBilling();
    useCartStore.getState().clearCart();
    useMartStore.getState().resetToOriginalState();
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
            {/* Option 1: Instant Checkout (Direct to standalone /checkout page) */}
            <button
              type="button"
              onClick={() => {
                skipToReview();
                router.push('/checkout');
              }}
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

  // Dedicated Checkout Routing:
  // After scanning finishes, review/payment happens on standalone /checkout with zero black screens
  return null;
};
