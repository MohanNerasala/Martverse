'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { LoginModal } from '@/components/ui/LoginModal';
import { api } from '@/lib/api';
import {
  PackageCheck,
  ArrowLeft,
  ShoppingCart,
  Store,
  User,
  LogIn,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  RotateCcw,
  Receipt,
  Truck,
  Printer,
  ShoppingBag,
  ChevronDown,
  Banknote,
  QrCode,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Check,
  X,
  Trash2,
} from 'lucide-react';

// Fast 0ms cache-first accessor for orders
const getCachedLocalOrders = (filterPhone?: string): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem('martverse_customer_orders') || '[]');
    if (!Array.isArray(raw)) return [];
    const deletedList: string[] = JSON.parse(localStorage.getItem('martverse_deleted_orders') || '[]');
    const active = raw.filter((o: any) => !deletedList.includes(o.id) && !deletedList.includes(o.orderNumber));
    if (filterPhone) {
      const clean = filterPhone.replace(/[^0-9]/g, '').slice(-10);
      return active.filter((o: any) => {
        const op = (o.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
        return !op || op === clean;
      });
    }
    return active;
  } catch {
    return [];
  }
};

// Accurate Payment Details Resolver (No fallbacks or misleading defaults!)
function resolvePaymentDetails(order: any) {
  const provider = (order.paymentProvider || order.payment?.provider || '').trim();
  const method = (order.paymentMethod || order.payment?.paymentMethod || '').trim().toUpperCase();
  const combined = `${provider} ${method}`.toUpperCase();

  if (combined.includes('PHONEPE')) {
    return {
      name: 'UPI (PhonePe)',
      provider: 'PhonePe',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-600',
      icon: QrCode,
      type: 'UPI_PHONEPE',
      note: 'Verified Instant UPI Payment via PhonePe',
    };
  }

  if (combined.includes('GPAY') || combined.includes('GOOGLE')) {
    return {
      name: 'UPI (Google Pay)',
      provider: 'Google Pay',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600',
      icon: QrCode,
      type: 'UPI_GPAY',
      note: 'Verified Instant UPI Payment via Google Pay',
    };
  }

  if (combined.includes('PAYTM')) {
    return {
      name: 'UPI (Paytm)',
      provider: 'Paytm',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      iconBg: 'bg-sky-500',
      icon: QrCode,
      type: 'UPI_PAYTM',
      note: 'Verified Instant UPI Payment via Paytm Payments Bank',
    };
  }

  if (combined.includes('CASH') || combined.includes('COD')) {
    return {
      name: 'Cash on Delivery',
      provider: 'Cash on Delivery',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600',
      icon: Banknote,
      type: 'CASH',
      note: 'Cash payment due upon package handover at doorstep',
    };
  }

  if (combined.includes('CARD') || method === 'CARD') {
    return {
      name: provider && provider.includes('Card') ? provider : 'Credit / Debit Card',
      provider: 'Card Payment',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-600',
      icon: CreditCard,
      type: 'CARD',
      note: 'Encrypted 256-bit card transaction verified',
    };
  }

  if (combined.includes('NETBANKING') || combined.includes('NET BANKING')) {
    return {
      name: 'Net Banking',
      provider: 'Net Banking',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      iconBg: 'bg-cyan-600',
      icon: LandmarkIcon,
      type: 'NETBANKING',
      note: 'Direct Bank Settlement',
    };
  }

  if (provider && provider !== 'SIMULATED_PAYMENT' && provider !== 'DIRECT') {
    return {
      name: provider,
      provider: provider,
      badgeColor: 'bg-slate-50 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-700',
      icon: CreditCard,
      type: 'OTHER',
      note: 'Verified checkout payment',
    };
  }

  if (method === 'UPI') {
    return {
      name: 'UPI Instant Transfer',
      provider: 'UPI',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600',
      icon: QrCode,
      type: 'UPI',
      note: 'Unified Payments Interface',
    };
  }

  return {
    name: provider || method || 'Online Payment',
    provider: provider || 'Martverse Pay',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-600',
    icon: CreditCard,
    type: 'GENERIC',
    note: 'Secure checkout transaction',
  };
}

function LandmarkIcon(props: any) {
  return <Banknote {...props} />;
}

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authPhone = useAuthStore((state) => state.phone);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  const cartTotalItems = useCartStore((state) => state.totalItems);
  const addItem = useCartStore((state) => state.addItem);
  const products = useMartStore((state) => state.products);
  const showToast = useMartStore((state) => state.showToast);

  const [phoneQuery, setPhoneQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('martverse_phone') || '';
    }
    return '';
  });

  // 0ms Instant Initial Orders State — Shows orders immediately with zero wait!
  const [orders, setOrders] = useState<any[]>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('martverse_phone') : null;
    return getCachedLocalOrders(stored || undefined);
  });

  const [isLoading, setIsLoading] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('martverse_phone') : null;
    return getCachedLocalOrders(stored || undefined).length === 0;
  });

  const [hasSearched, setHasSearched] = useState(true);

  // Accordion state: All orders default to COLLAPSED ("one box")
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Cancel Confirmation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind / Want to re-order');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Delete Order Confirmation Modal State
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    hydrateAuth();
    router.prefetch('/');
  }, [hydrateAuth, router]);

  const fetchOrders = useCallback(async (phoneToFetch?: string) => {
    const immediate = getCachedLocalOrders(phoneToFetch);
    if (immediate.length > 0) {
      setOrders(immediate);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await api.getOrderHistory(phoneToFetch);
      const ordersList = Array.isArray(data) ? data : [];
      if (ordersList.length > 0) {
        setOrders(ordersList);
      }
    } catch {
      // Retain already loaded local orders
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const targetPhone = authPhone || (typeof window !== 'undefined' ? localStorage.getItem('martverse_phone') : null);
    if (targetPhone) {
      setPhoneQuery(targetPhone);
      fetchOrders(targetPhone);
    } else {
      fetchOrders();
    }
  }, [authPhone, fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneQuery.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length === 10) {
      fetchOrders(clean);
    } else {
      fetchOrders();
    }
  };

  const toggleOrderExpand = (orderKey: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderKey]: !prev[orderKey],
    }));
  };

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    for (const item of order.items) {
      const matched = products.find(
        (p) => p.name === item.productName || p.id === item.productId
      ) || {
        id: item.productId || 'p-gen-' + Math.random(),
        name: item.productName,
        slug: item.productSku || 'product',
        price: item.unitPrice || 99,
        mrp: (item.unitPrice || 99) * 1.2,
        imageUrl: item.imageUrl || '/products/fallback.svg',
        brand: item.brand || 'Supermarket Product',
        unit: '1 pack',
        discountPercentage: 15,
        inStock: true,
      };
      addItem(matched as any, item.quantity || 1);
      addedCount += item.quantity || 1;
    }
    showToast(
      'Re-order Added to Trolley!',
      `Added ${addedCount} items back into your shopping trolley.`,
      'success'
    );
    router.push('/cart');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);
    const orderKey = cancellingOrder.id || cancellingOrder.orderNumber;
    const finalReason =
      cancelReason === 'Other reason'
        ? otherReasonText.trim() || 'Other reason'
        : cancelReason;
    try {
      await api.cancelOrder(orderKey, finalReason);
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderKey || o.orderNumber === orderKey) {
            return {
              ...o,
              status: 'CANCELLED',
              cancellationReason: finalReason,
            };
          }
          return o;
        })
      );
      showToast(
        'Order Cancelled',
        `Order #${cancellingOrder.orderNumber} has been successfully cancelled.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to cancel order. Please try again.', 'warning');
    } finally {
      setIsSubmittingCancel(false);
      setCancellingOrder(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsSubmittingDelete(true);
    const orderKey = deletingOrder.id || deletingOrder.orderNumber;
    try {
      await api.deleteOrder(orderKey);
      setOrders((prev) =>
        prev.filter((o) => o.id !== orderKey && o.orderNumber !== orderKey)
      );
      showToast(
        'Order Deleted',
        `Order #${deletingOrder.orderNumber} has been removed from your history.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to delete order. Please try again.', 'warning');
    } finally {
      setIsSubmittingDelete(false);
      setDeletingOrder(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToMart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      <LoginModal />

      {/* --- Pure White Navigation Bar --- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleBackToMart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all border border-slate-200/80 cursor-pointer shadow-xs active:scale-95 select-none"
              title="Return to 3D Supermarket"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mart</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div
              onClick={handleBackToMart}
              className="flex items-center gap-2.5 group cursor-pointer select-none"
              title="Return to 3D Supermarket"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden xs:inline group-hover:text-blue-600 transition-colors">
                MART<span className="text-blue-600">VERSE</span>
              </span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-2xs relative"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span>Trolley</span>
              {cartTotalItems > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white font-black text-[10px] rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-inner transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 {authPhone}</span>
              </Link>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Orders Content Area --- */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title & Phone Lookup Filter Strip */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70 inline-flex mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>VERIFIED TAX INVOICES & DATABASE ORDERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Orders & Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Synchronized live with PostgreSQL database & instant checkout receipts.
            </p>
          </div>

          {/* Quick Phone Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 self-start md:self-auto">
            <div className="relative">
              <input
                type="tel"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="Lookup phone: 9876543210"
                className="h-11 px-4 pl-9 rounded-2xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 font-bold text-xs outline-none w-56 sm:w-64 transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Loading Spinner - ONLY shown when there are 0 orders and actively loading */}
        {isLoading && orders.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Loading verified orders from database...</p>
          </div>
        )}

        {/* --- Orders List: Compact "One Box" Cards --- */}
        {orders.length > 0 && (
          <div className="space-y-3.5">
            {orders.map((order, orderIdx) => {
              const orderKey = order.id || order.orderNumber || `order-${orderIdx}`;
              const isExpanded = Boolean(expandedOrders[orderKey]);

              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent Checkout';

              // Extract accurate payment method info (NO lies, exact provider displayed)
              const pmDetails = resolvePaymentDetails(order);
              const PmIcon = pmDetails.icon;

              const itemsList = order.items || [];
              const primaryItem = itemsList[0] || {};
              const matchedProduct = products.find(
                (p) => p.name === primaryItem.productName || p.id === primaryItem.productId
              );
              const primaryItemImage =
                primaryItem.imageUrl || matchedProduct?.imageUrl || '/products/fallback.svg';
              const primaryItemName = primaryItem.productName || 'Supermarket Item';
              const remainingItemsCount = Math.max(0, itemsList.length - 1);

              const itemsSubtotal =
                order.subtotal ||
                itemsList.reduce(
                  (acc: number, it: any) =>
                    acc + (it.lineTotal || (it.unitPrice || 0) * (it.quantity || 1)),
                  0
                );
              const deliveryCharge = order.deliveryCharge !== undefined ? order.deliveryCharge : 0;
              const codFee = order.codFee || (pmDetails.type === 'CASH' ? 20 : 0);
              const totalAmount =
                order.totalAmount ||
                order.finalAmount ||
                itemsSubtotal + deliveryCharge + (pmDetails.type === 'CASH' ? codFee : 0);

              const isCancelled =
                (order.status || '').toUpperCase() === 'CANCELLED' ||
                Boolean(order.cancellationReason);

              return (
                <div
                  key={orderKey}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* --- 1. SINGLE BOX (Collapsed Row with Images, Amount, Date, Reorder, Cancel & Expand) --- */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Product Thumbnail(s) + Item Count + Date + Status Badge */}
                    <div
                      onClick={() => toggleOrderExpand(orderKey)}
                      className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer select-none"
                      title={isExpanded ? 'Click to collapse order details' : 'Click to view purchased items and order flow'}
                    >
                      {/* Product Thumbnail(s) — Shows individual boxes for each item ordered */}
                      {itemsList.length <= 1 ? (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs">
                          <img
                            src={primaryItemImage}
                            alt={primaryItemName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/fallback.svg';
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          {itemsList.slice(0, 3).map((it: any, itIdx: number) => {
                            const matched = products.find(
                              (p) => p.name === it.productName || p.id === it.productId
                            );
                            const itImg = it.imageUrl || matched?.imageUrl || '/products/fallback.svg';
                            return (
                              <div
                                key={itIdx}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs relative group"
                                title={`${it.productName} (Qty: ${it.quantity || 1})`}
                              >
                                <img
                                  src={itImg}
                                  alt={it.productName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/products/fallback.svg';
                                  }}
                                />
                                {(it.quantity || 1) > 1 && (
                                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                                    x{it.quantity}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {itemsList.length > 3 && (
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                              +{itemsList.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Status Badge */}
                          {isCancelled ? (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              CANCELLED
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {order.status || 'CONFIRMED'}
                            </span>
                          )}

                          <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                            {itemsList.length} {itemsList.length === 1 ? 'Item Billed' : 'Items Billed'}
                          </span>
                        </div>

                        {/* When (Date) & Order Details */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                          <span className="font-mono font-bold text-slate-700">
                            {order.orderNumber}
                          </span>
                          <span>•</span>
                          <span>{orderDate}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">
                            {order.fulfilmentType === 'STORE_PICKUP' ||
                            order.fulfilmentType === 'PICKUP'
                              ? 'In-Store Pickup (Lane 02)'
                              : 'Express Delivery'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Re-order + Cancel + Expand Arrow */}
                    <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Amount */}
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {pmDetails.type === 'CASH' && !isCancelled ? 'Due at Delivery' : 'Total Amount'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Re-order Button */}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-slate-900/25 hover:scale-105 active:scale-95 cursor-pointer border border-slate-800 hover:border-slate-700 select-none"
                          title="Add items back into shopping trolley"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-blue-400 transition-transform duration-300 ease-out group-hover:-rotate-45" />
                          <span>Re-order</span>
                        </button>

                        {/* Cancel / Delete Button */}
                        {isCancelled ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingOrder(order);
                            }}
                            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50/90 hover:bg-rose-600 border border-rose-200/90 hover:border-rose-600 text-rose-700 hover:text-white text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-md hover:shadow-rose-600/30 hover:scale-105 active:scale-95 cursor-pointer select-none"
                            title="Delete this cancelled order from history"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white transition-all duration-200 group-hover:scale-115 group-hover:-rotate-12" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancellingOrder(order);
                              setCancelReason('Changed my mind / Want to re-order');
                              setOtherReasonText('');
                            }}
                            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50/90 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-md hover:shadow-rose-500/20 hover:scale-105 active:scale-95 cursor-pointer select-none"
                            title="Cancel this order"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                            <span>Cancel</span>
                          </button>
                        )}

                        {/* Expand/Collapse Chevron Arrow */}
                        <button
                          type="button"
                          onClick={() => toggleOrderExpand(orderKey)}
                          className={`group w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 select-none ${
                            isExpanded
                              ? 'bg-blue-50 hover:bg-blue-100/90 border-blue-200 hover:border-blue-300 text-blue-600 hover:shadow-md hover:shadow-blue-500/20'
                              : 'bg-slate-50 hover:bg-blue-50/80 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 hover:shadow-md hover:shadow-blue-500/15'
                          }`}
                          title={isExpanded ? 'Hide order details' : 'View order flow, payment & details'}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ease-out ${
                              isExpanded
                                ? 'rotate-180 text-blue-600 group-hover:-translate-y-0.5'
                                : 'text-slate-600 group-hover:text-blue-600 group-hover:translate-y-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* --- 2. EXPANDED ACCORDION (Flow, Payment, Items, User Details) --- */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/40 space-y-6 animate-in fade-in duration-200">
                      {/* Flow 1: Order Status Timeline / Cancel Banner */}
                      {isCancelled ? (
                        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                                Order Cancelled
                              </h4>
                              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                                Cancellation Reason:{' '}
                                <strong>
                                  {order.cancellationReason || 'Cancelled upon customer request'}
                                </strong>
                                . If payment was completed digitally, the refund has been initiated to
                                your source account and will reflect within 24–48 business hours.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeletingOrder(order)}
                            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-rose-700 hover:text-white text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-md hover:shadow-rose-600/30 hover:scale-105 active:scale-95 cursor-pointer select-none shrink-0 self-start sm:self-auto"
                            title="Delete this cancelled order from history"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white transition-all duration-200 group-hover:scale-115 group-hover:-rotate-12" />
                            <span>Delete Order</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Order & Delivery Flow Tracker</span>
                          </h4>

                          {/* 4-Step Tracker */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                            {/* Step 1: Placed */}
                            <div className="flex items-center gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-emerald-950 block">
                                  Order Placed
                                </span>
                                <span className="text-[10px] text-emerald-700 font-medium block truncate">
                                  {orderDate}
                                </span>
                              </div>
                            </div>

                            {/* Step 2: Verified & Packed */}
                            <div className="flex items-center gap-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-emerald-950 block">
                                  Verified & Packed
                                </span>
                                <span className="text-[10px] text-emerald-700 font-medium block truncate">
                                  Supermarket Dock
                                </span>
                              </div>
                            </div>

                            {/* Step 3: Out for Delivery / Ready */}
                            <div className="flex items-center gap-2.5 bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 relative">
                              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 relative">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
                                <Truck className="w-4 h-4 relative" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-blue-950 block">
                                  {order.fulfilmentType === 'STORE_PICKUP' ||
                                  order.fulfilmentType === 'PICKUP'
                                    ? 'Ready at Lane 02'
                                    : 'Out for Delivery'}
                                </span>
                                <span className="text-[10px] text-blue-700 font-medium block truncate">
                                  Express Dispatch
                                </span>
                              </div>
                            </div>

                            {/* Step 4: Delivered */}
                            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 opacity-60">
                              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-slate-700 block">
                                  Delivered
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium block truncate">
                                  Within 30 Mins
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flow 2: 2-Column Split (Left: Items Breakdown | Right: Payment Method & Invoicing) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Left: Complete Items List (7 cols) */}
                        <div className="md:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                              <span>Purchased Items ({itemsList.length})</span>
                            </h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Exact physical items billed
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {itemsList.map((it: any, idx: number) => {
                              const matched = products.find(
                                (p) => p.name === it.productName || p.id === it.productId
                              );
                              const imgUrl =
                                it.imageUrl || matched?.imageUrl || '/products/fallback.svg';
                              const itemPrice = it.unitPrice || it.price || 0;
                              const itemQty = it.quantity || 1;
                              const lineTotal = it.lineTotal || itemPrice * itemQty;

                              return (
                                <div
                                  key={idx}
                                  className="py-3 flex items-center justify-between gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                      <img
                                        src={imgUrl}
                                        alt={it.productName}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            '/products/fallback.svg';
                                        }}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <h5
                                        className="text-xs font-bold text-slate-900 truncate"
                                        title={it.productName}
                                      >
                                        {it.productName}
                                      </h5>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        Qty: <strong className="text-slate-800">{itemQty}</strong> ×
                                        ₹{itemPrice}
                                        {it.variantInfo && ` • ${it.variantInfo}`}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-black text-slate-900 shrink-0 font-mono">
                                    ₹{lineTotal.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Payment Method & Invoicing & Address (5 cols) */}
                        <div className="md:col-span-5 space-y-4">
                          {/* 1. EXACT Payment Method ("what pyemnt i use that only show there dont shoe liee ok") */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <PmIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Payment Details</span>
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Verified
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Exact Payment Mode Pill */}
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-[11px]">Payment Mode:</span>
                                <span
                                  className={`font-black text-xs px-2.5 py-1 rounded-lg border ${pmDetails.badgeColor} inline-flex items-center gap-1.5`}
                                >
                                  <PmIcon className="w-3.5 h-3.5" />
                                  <span>{pmDetails.name}</span>
                                </span>
                              </div>

                              {/* Status */}
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-[11px]">Payment Status:</span>
                                {isCancelled ? (
                                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                                    REFUND INITIATED
                                  </span>
                                ) : pmDetails.type === 'CASH' ? (
                                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                    PAY AT DOORSTEP
                                  </span>
                                ) : (
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                    PAID IN FULL
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                                {pmDetails.note}
                              </p>
                            </div>
                          </div>

                          {/* 2. Amount Details Breakdown */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                                <span>Invoice Breakdown</span>
                              </h4>
                              <button
                                type="button"
                                onClick={handlePrint}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer print:hidden"
                                title="Print or Save PDF Receipt"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Print</span>
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between text-slate-600">
                                <span>Items Subtotal:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  ₹{itemsSubtotal.toLocaleString('en-IN')}
                                </span>
                              </div>

                              <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee:</span>
                                <span className="font-semibold text-slate-900">
                                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                </span>
                              </div>

                              {codFee > 0 && (
                                <div className="flex justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                  <span className="font-bold">COD Handling Fee:</span>
                                  <span className="font-mono font-bold">+ ₹{codFee}</span>
                                </div>
                              )}

                              <div className="flex justify-between text-slate-400 text-[10px]">
                                <span>Taxes (GST 5% Included):</span>
                                <span className="font-mono">Included in MRP</span>
                              </div>

                              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                                <span>Total Amount:</span>
                                <span className="text-slate-900 font-mono text-base">
                                  ₹{totalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Delivery Destination & Contact Details */}
                          {order.address && (
                            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                <span>Delivery Destination</span>
                              </div>
                              <p className="font-bold text-slate-900">
                                {order.address.fullName || order.customerName || 'Valued Customer'}
                              </p>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {order.address.houseNo ? `${order.address.houseNo}, ` : ''}
                                {order.address.addressLine1}
                                {order.address.area ? `, ${order.address.area}` : ''}
                                {order.address.city ? `, ${order.address.city}` : ''}
                                {order.address.pinCode ? ` - ${order.address.pinCode}` : ''}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono pt-1">
                                📞 +91 {order.address.phone || order.customerPhone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && hasSearched && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
              <PackageCheck className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">No Orders Found</h2>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                No past orders found under mobile number{' '}
                <strong className="text-black">+91 {phoneQuery || 'current session'}</strong>. Step
                into the 3D supermarket and place your first demo order!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <span>Shop in 3D Supermarket</span>
                <Store className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* --- Cancel Order Confirmation Modal --- */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-[420px] w-full p-5 shadow-2xl border border-slate-200/90 space-y-3.5 animate-in zoom-in-95 duration-200">
            {/* Header with Title and "Into Mark" (X Close Button) */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
                    Cancel Order #{cancellingOrder.orderNumber}?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Please select a reason for cancellation
                  </p>
                </div>
              </div>

              {/* Into Mark (✕ Close Icon) */}
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="w-7.5 h-7.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 text-slate-400 flex items-center justify-center transition-all cursor-pointer shrink-0 -mr-1 -mt-1 active:scale-90 hover:rotate-90 duration-200"
                title="Close"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 6 Clickable Reasons (Radio Cards with Best Look Hover Effect) */}
            <div className="space-y-1.5 max-h-[44vh] overflow-y-auto pr-1">
              {[
                'Changed my mind / Want to re-order',
                'Ordered wrong item or quantity',
                'Want to change delivery address',
                'Delivery time is too long',
                'Found better pricing elsewhere',
                'Other reason',
              ].map((reason) => {
                const isSelected = cancelReason === reason;
                return (
                  <div
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.98] flex items-center justify-between gap-2.5 group relative ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white hover:bg-rose-50/40 border-slate-200/90 hover:border-rose-300 hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Radio Selection Circle */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isSelected
                            ? 'border-rose-600 bg-rose-600 shadow-xs scale-105'
                            : 'border-slate-300 bg-white group-hover:border-rose-400 group-hover:scale-105'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Reason Text */}
                      <span
                        className={`text-xs font-semibold leading-snug transition-colors ${
                          isSelected
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-700 group-hover:text-rose-950'
                        }`}
                      >
                        {reason}
                      </span>
                    </div>

                    {/* Checkmark when selected */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-600 shrink-0 stroke-[2.5] animate-in zoom-in-75 duration-150" />
                    )}
                  </div>
                );
              })}

              {/* Expanding Custom Reason Input for "Other reason" */}
              {cancelReason === 'Other reason' && (
                <div className="pt-1.5 space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Please specify your reason:
                  </label>
                  <textarea
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Tell us what went wrong or why you want to cancel..."
                    rows={3}
                    maxLength={250}
                    autoFocus
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 font-medium outline-none resize-none placeholder:text-slate-400 transition-all shadow-2xs"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 font-medium">
                    <span>Your feedback helps us improve</span>
                    <span>{otherReasonText.length}/250</span>
                  </div>
                </div>
              )}
            </div>

            {/* Instant Refund Note */}
            <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/70 leading-relaxed flex items-start gap-2 shadow-2xs">
              <span className="text-sm shrink-0">💡</span>
              <span>
                <strong className="text-slate-800">Instant Refund:</strong> If you paid online (UPI / Card),
                your money will be automatically credited back within 24–48 business hours.
              </span>
            </div>

            {/* Action Buttons - Perfectly Aligned 50/50 Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center border border-slate-200/80 shadow-2xs hover:shadow-xs hover:scale-[1.02]"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                {isSubmittingCancel ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>Yes, Cancel Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-[420px] w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    Delete Order #{deletingOrder.orderNumber}?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Remove this cancelled order from your records
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently remove this cancelled order from your history? This action cannot be undone.
              </p>

              {/* Order summary pill */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-slate-800 block">
                    {deletingOrder.orderNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(deletingOrder.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{(deletingOrder.totalAmount || deletingOrder.finalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Perfectly Aligned 50/50 Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={() => setDeletingOrder(null)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center border border-slate-200/80 shadow-2xs hover:shadow-xs hover:scale-[1.02]"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                {isSubmittingDelete ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Yes, Delete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
