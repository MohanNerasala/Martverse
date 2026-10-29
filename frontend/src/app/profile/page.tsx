'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useMartStore } from '@/store/useMartStore';
import { LoginModal } from '@/components/ui/LoginModal';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Store,
  User,
  LogIn,
  LogOut,
  ShoppingCart,
  Heart,
  History,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  Camera,
  Compass,
  ShieldCheck,
  Phone,
  ChevronRight,
  PackageCheck,
  Sparkles,
  Receipt,
  RotateCcw,
  ExternalLink,
  MapPin,
  Clock,
  CreditCard,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authPhone = useAuthStore((state) => state.phone);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const logout = useAuthStore((state) => state.logout);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  const cartTotalItems = useCartStore((state) => state.totalItems);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const wishlistItems = useWishlistStore((state) => state.items);

  const isSoundMuted = useMartStore((state) => state.isSoundMuted);
  const toggleSound = useMartStore((state) => state.toggleSound);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const isMinimapOpen = useMartStore((state) => state.isMinimapOpen);
  const toggleMinimap = useMartStore((state) => state.toggleMinimap);
  const showToast = useMartStore((state) => state.showToast);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const fetchOrders = useCallback(async (phone: string) => {
    setIsLoadingOrders(true);
    try {
      const data = await api.getOrderHistory(phone);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (authPhone) {
      fetchOrders(authPhone);
    } else {
      fetchOrders('9876543210');
    }
  }, [authPhone, fetchOrders]);

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been signed out successfully.', 'info');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <LoginModal />

      {/* --- Pure White Navigation Bar --- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Back & Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all border border-slate-200"
              title="Return to 3D Supermarket"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mart</span>
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

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 text-xs font-bold transition-all shadow-sm"
              title="Open Separate Orders Page"
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Orders</span>
              {orders.length > 0 && (
                <span className="bg-blue-600 text-white font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-sm relative"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Trolley</span>
              {cartTotalItems > 0 && (
                <span className="bg-rose-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Profile Content --- */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {!isAuthenticated ? (
          /* Sign In Required Card */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black text-slate-900">Sign In to Your Account</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Log in with your Indian mobile number to view profile details, verified order receipts, and preferences.
              </p>
            </div>
            <button
              onClick={() => openLoginModal()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Mobile (+91)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* --- Premium White Profile Header Card --- */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                {/* Avatar Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-50 shrink-0">
                  <User className="w-10 h-10" />
                </div>

                {/* Profile Details */}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      My Profile
                    </h1>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80 text-[11px] font-bold self-center sm:self-auto">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Mobile Account</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>+91 {authPhone}</span>
                    </div>
                  </div>

                  {/* Quick Real-Time Metrics Strip */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
                      <div className="text-lg sm:text-xl font-black text-slate-900">{cartTotalItems}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">Trolley Items</div>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
                      <div className="text-lg sm:text-xl font-black text-rose-600">{wishlistItems.length}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">Saved Wishlist</div>
                    </div>

                    <Link
                      href="/orders"
                      className="bg-blue-50/60 hover:bg-blue-100/60 rounded-2xl p-3 text-center border border-blue-100 transition-all group"
                      title="Click to view all orders"
                    >
                      <div className="text-lg sm:text-xl font-black text-blue-700 group-hover:scale-105 transition-transform">
                        {orders.length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-blue-600 font-bold mt-0.5 flex items-center justify-center gap-1">
                        <span>Past Orders</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>

                    <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
                      <div className="text-lg sm:text-xl font-black text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">Trolley Value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Primary Action Cards Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Separate Orders Page Card (Prominent User Focus) */}
              <Link
                href="/orders"
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-blue-400 hover:shadow-md transition-all text-left group shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shrink-0 group-hover:scale-105 transition-transform">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                        My Orders & Receipts
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {orders.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Open dedicated orders page with live Spring Boot order history, line item breakdown, and invoice reprint.
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Saved Wishlist Card */}
              <button
                onClick={() => {
                  useWishlistStore.getState().toggleWishlist(true);
                  router.push('/');
                }}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-rose-400 hover:shadow-md transition-all text-left group shadow-sm flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80 shrink-0 group-hover:scale-105 transition-transform">
                    <Heart className="w-6 h-6 fill-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base group-hover:text-rose-700 transition-colors">
                        Saved Wishlist
                      </h3>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {wishlistItems.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      View favourite products and add them directly to your 3D trolley with single-click re-stock.
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-rose-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Store Experience Settings Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">3D Store Controls</h3>
                    <p className="text-[11px] text-slate-500">Audio, Camera & Navigation</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-bold text-slate-700">Ambient Supermarket Sound</span>
                    <button
                      onClick={toggleSound}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                        !isSoundMuted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {!isSoundMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{!isSoundMuted ? 'Muted: OFF' : 'Muted: ON'}</span>
                    </button>
                  </div>

                  {/* Camera Mode */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-bold text-slate-700">Camera Perspective</span>
                    <button
                      onClick={() =>
                        setCameraMode(cameraMode === 'third_person' ? 'first_person' : 'third_person')
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer"
                    >
                      {cameraMode === 'first_person' ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>{cameraMode === 'first_person' ? '1st Person' : '3rd Person'}</span>
                    </button>
                  </div>

                  {/* Minimap Toggle */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-bold text-slate-700">Overhead Minimap Radar</span>
                    <button
                      onClick={() => toggleMinimap()}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                        isMinimapOpen
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isMinimapOpen ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue Shopping Card */}
              <Link
                href="/"
                className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:border-emerald-400 hover:shadow-md transition-all text-left group shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0 group-hover:scale-105 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      Back to 3D Mart
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Return to your 3D supermarket trolley and continue browsing Aisles 1 – 5 with real packaging.
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>

            {/* --- Recent Orders Preview Section --- */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Recent Order Activity</h2>
                  <p className="text-xs text-slate-500 font-medium">Synchronized with PostgreSQL & Local Checkout</p>
                </div>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs transition-all border border-blue-200"
                >
                  <span>Open Orders Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoadingOrders ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Loading orders from backend...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <PackageCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">No Past Orders Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Items purchased in the 3D Supermarket or via the checkout line will appear here and on the Orders page.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Shop in 3D Mart Now</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any, idx: number) => (
                    <div
                      key={order.orderNumber || order.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-mono font-black text-xs shadow-sm">
                          #{order.orderNumber ? order.orderNumber.slice(-4) : idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              {order.payment?.status || order.status || 'CONFIRMED'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'Recent Order'} • {order.items ? `${order.items.length} items` : '1 pack'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900">
                            ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link
                          href="/orders"
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <span>View Bill</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <Link
                      href="/orders"
                      className="text-xs font-black text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View all {orders.length} orders in dedicated Orders Page</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
