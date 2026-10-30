'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useMartStore } from '@/store/useMartStore';
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
  ExternalLink,
  Sparkles,
  Printer,
  ShoppingBag,
  ChevronDown,
  Banknote,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

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

  const [phoneQuery, setPhoneQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const fetchOrders = useCallback(async (phoneToFetch?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getOrderHistory(phoneToFetch);
      const ordersList = Array.isArray(data) ? data : [];
      setOrders(ordersList);
      // Auto-expand the first order for great UX
      if (ordersList.length > 0) {
        const firstKey = ordersList[0].id || ordersList[0].orderNumber || 'order-0';
        setExpandedOrders({ [firstKey]: true });
      }
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    if (authPhone) {
      setPhoneQuery(authPhone);
      fetchOrders(authPhone);
    } else {
      // Fetch both default phone and any recently placed local orders
      fetchOrders('9876543210');
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      <LoginModal />

      {/* --- Pure White Navigation Bar --- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all border border-slate-200/80"
              title="Return to 3D Supermarket"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mart</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden xs:inline">
                MART<span className="text-blue-600">VERSE</span>
              </span>
            </Link>
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title & Phone Lookup Filter Strip */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
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

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Loading verified orders from database...</p>
          </div>
        )}

        {/* Orders List with Tap-Arrow Accordion Expand/Collapse */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
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

              // Payment Method resolver
              const rawPm = (order.paymentMethod || order.paymentProvider || '').toUpperCase();
              let pmLabel = 'UPI';
              let PmIcon = QrCode;

              if (rawPm.includes('CASH') || rawPm.includes('COD')) {
                pmLabel = 'Cash on Delivery';
                PmIcon = Banknote;
              } else if (rawPm.includes('CARD')) {
                pmLabel = 'Credit/Debit Card';
                PmIcon = CreditCard;
              } else if (rawPm.includes('PHONEPE')) {
                pmLabel = 'UPI (PhonePe)';
                PmIcon = QrCode;
              } else if (rawPm.includes('PAYTM')) {
                pmLabel = 'UPI (Paytm)';
                PmIcon = QrCode;
              } else if (rawPm.includes('GPAY') || rawPm.includes('GOOGLE')) {
                pmLabel = 'UPI (Google Pay)';
                PmIcon = QrCode;
              } else if (order.paymentProvider) {
                pmLabel = order.paymentProvider;
              }

              const itemsList = order.items || [];
              const itemsSubtotal =
                order.subtotal ||
                itemsList.reduce(
                  (acc: number, it: any) => acc + (it.lineTotal || (it.unitPrice || 0) * (it.quantity || 1)),
                  0
                );
              const deliveryCharge = order.deliveryCharge !== undefined ? order.deliveryCharge : 0;
              const codFee = order.codFee || (pmLabel.includes('Cash') ? 20 : 0);
              const totalAmount = order.totalAmount || order.finalAmount || (itemsSubtotal + deliveryCharge + codFee);

              return (
                <div
                  key={orderKey}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Order Header Bar (Tap to Expand/Collapse with Arrow) */}
                  <div
                    onClick={() => toggleOrderExpand(orderKey)}
                    className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0">
                        <PackageCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm sm:text-base font-black text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {order.status || 'CONFIRMED'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {itemsList.length} {itemsList.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Placed on {orderDate} •{' '}
                          <span className="font-semibold text-slate-700">
                            {order.fulfilmentType === 'STORE_PICKUP' || order.fulfilmentType === 'PICKUP'
                              ? 'In-Store Pickup (Lane 02)'
                              : 'Express Home Delivery'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {pmLabel.includes('Cash') ? 'Due at Delivery' : 'Total Paid'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer active:scale-95 print:hidden"
                        title="Add items back into trolley"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Re-order</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint();
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer print:hidden"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Expand/Collapse Arrow Icon */}
                      <div
                        className={`w-8 h-8 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 shadow-2xs transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-blue-600' : ''
                        }`}
                        title={isExpanded ? 'Collapse order details' : 'Expand order details'}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section: Items + Which Payment Was Used + Amount Breakdown */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-200 bg-white">
                      {/* Left: Purchased Items (8 cols) */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                            <span>Purchased Items ({itemsList.length})</span>
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Exact physical items verified & billed
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {itemsList.map((it: any, idx: number) => {
                            const matched = products.find(
                              (p) => p.name === it.productName || p.id === it.productId
                            );
                            const imgUrl = it.imageUrl || matched?.imageUrl || '/products/fallback.svg';
                            const itemPrice = it.unitPrice || it.price || 0;
                            const itemQty = it.quantity || 1;
                            const lineTotal = it.lineTotal || itemPrice * itemQty;

                            return (
                              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                    <img
                                      src={imgUrl}
                                      alt={it.productName}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/products/fallback.svg';
                                      }}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-slate-900 truncate" title={it.productName}>
                                      {it.productName}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                      Qty: <strong className="text-slate-800">{itemQty}</strong> × ₹{itemPrice}
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

                      {/* Right: Payment Method Used + Amount Breakdown + Address (4 cols) */}
                      <div className="md:col-span-4 space-y-4">
                        {/* 1. Which Payment Method Was Used ("which payment use all show ok") */}
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-200/60">
                            <PmIcon className="w-4 h-4 text-emerald-600" />
                            <span>Payment Method Used</span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 text-[11px]">Payment Mode:</span>
                              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                                {pmLabel}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 text-[11px]">Payment Status:</span>
                              <span className="font-bold text-emerald-700">
                                {order.paymentStatus || (pmLabel.includes('Cash') ? 'PAYMENT DUE AT DOORSTEP' : 'PAID IN FULL')}
                              </span>
                            </div>
                            {order.payment?.providerPaymentId && (
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>Txn ID:</span>
                                <span>{order.payment.providerPaymentId}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. Amount Details Breakdown ("in orders page show amount details view") */}
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-200/60">
                            <Receipt className="w-4 h-4 text-blue-600" />
                            <span>Amount Details Breakdown</span>
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
                                <span className="font-bold">COD Handling Charge:</span>
                                <span className="font-mono font-bold">+ ₹{codFee}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-slate-500 text-[11px]">
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

                        {/* 3. Delivery Destination Address */}
                        {order.address && (
                          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200/60">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              <span>Delivery Destination</span>
                            </div>
                            <p className="font-bold text-slate-900 pt-1">
                              {order.address.fullName || order.customerName || 'Valued Customer'}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {order.address.houseNo ? `${order.address.houseNo}, ` : ''}
                              {order.address.addressLine1}
                              {order.address.area ? `, ${order.address.area}` : ''}
                              {order.address.city ? `, ${order.address.city}` : ''}
                              {order.address.pinCode ? ` - ${order.address.pinCode}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              📞 +91 {order.address.phone || order.customerPhone}
                            </p>
                          </div>
                        )}
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
                No past orders found under mobile number <strong className="text-black">+91 {phoneQuery || 'current session'}</strong>.
                Step into the 3D supermarket and place your first demo order!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xs transition-all"
              >
                <span>Shop in 3D Supermarket</span>
                <Store className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
