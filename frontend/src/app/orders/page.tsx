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

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const fetchOrders = useCallback(async (phoneToFetch: string) => {
    setIsLoading(true);
    try {
      const data = await api.getOrderHistory(phoneToFetch);
      setOrders(Array.isArray(data) ? data : []);
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
      // Default initial fetch for demo phone
      fetchOrders('9876543210');
    }
  }, [authPhone, fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneQuery.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length === 10) {
      fetchOrders(clean);
    } else {
      showToast('Validation Error', 'Please enter a valid 10-digit mobile number.', 'warning');
    }
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
        imageUrl: '/images/products/surf-excel.png',
        brand: 'Supermarket Brand',
        unit: '1 pc',
        discountPercentage: 15,
        rating: 4.8,
        inStock: true,
        category: { id: 'c1', name: 'Groceries' },
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <LoginModal />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Back Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black font-extrabold text-xs transition-all border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to 3D Mart</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Store className="w-5 h-5 text-white" />
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-sm relative"
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
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-inner">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 {authPhone}</span>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Title & Phone Lookup Filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70 inline-flex mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>LIVE DATABASE ORDERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Orders & Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Real-time synchronization with Spring Boot database (`/api/orders/history`).
            </p>
          </div>

          {/* Quick Phone Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 self-start md:self-auto">
            <div className="relative">
              <input
                type="tel"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                placeholder="Search phone: 9876543210"
                className="h-11 px-4 pl-9 rounded-2xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 font-bold text-xs outline-none w-56 sm:w-64 transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Lookup'}
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Fetching verified orders from database...</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id || order.orderNumber}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Order Header Strip */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {order.status || 'CONFIRMED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Placed on {order.createdAt || 'Recent Session'} •{' '}
                        {order.fulfilmentType === 'PICKUP' ? 'Store Pickup' : 'Express Delivery'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium block">Total Paid</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-black text-slate-800 transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>

                {/* Items & Address Grid */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Items List (Left 8 cols) */}
                  <div className="md:col-span-8 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Ordered Products ({(order.items || []).length})
                    </h4>
                    
                    <div className="divide-y divide-slate-100">
                      {(order.items || []).map((it: any, idx: number) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xs flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-900 truncate">
                                {it.productName}
                              </h5>
                              <p className="text-[11px] text-slate-500 font-medium">
                                Qty: {it.quantity} × ₹{it.unitPrice}
                                {it.variantInfo && ` • ${it.variantInfo}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-slate-900">
                            ₹{(it.lineTotal || (it.unitPrice * it.quantity)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info & Payment (Right 4 cols) */}
                  <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    {order.address && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          {order.address.fullName || 'Valued Customer'}
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {order.address.addressLine1}
                          {order.address.city && `, ${order.address.city}`}
                          {order.address.pinCode && ` - ${order.address.pinCode}`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          📞 +91 {order.address.phone}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1 pt-3 border-t border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Payment Details</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Payment Status:</span>
                        <span className="text-emerald-700 font-bold">
                          {order.payment?.status || 'SIMULATED_SUCCESS'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Gateway:</span>
                        <span className="text-slate-800 font-medium">Demo Payment Direct</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                No orders found under mobile number <strong className="text-black">+91 {phoneQuery}</strong>.
                Step into the 3D supermarket and place your first demo order!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
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
