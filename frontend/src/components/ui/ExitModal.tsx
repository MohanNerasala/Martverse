'use client';

import React, { useState } from 'react';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Receipt,
  X,
  Store,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExitModal: React.FC = () => {
  const finalCompletedPopupOpen = useMartStore((state) => state.finalCompletedPopupOpen);
  const completedOrderNumber = useMartStore((state) => state.completedOrderNumber);
  const closeFinalCompletedPopup = useMartStore((state) => state.closeFinalCompletedPopup);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);

  const completedOrder = useBillingStore((state) => state.completedOrder);
  const clearCart = useCartStore((state) => state.clearCart);

  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  if (!finalCompletedPopupOpen) return null;

  const handleShopAgain = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {}
    clearCart();
    closeFinalCompletedPopup();
    // Reset player back to Entrance (z = -20)
    setPlayerPos([0, 1.5, -20], 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl max-w-lg w-full shadow-2xl p-7 text-center space-y-5 animate-in zoom-in-95 duration-200 relative border border-white/[0.08]">
        
        {/* Shopping Completed Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
          <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
        </div>

        {/* Heading & Supporting Message */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Supermarket Exit Sequence Finished
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Shopping Completed!</h2>
          <p className="text-xs sm:text-sm font-medium text-emerald-400">
            Thank you for shopping at MARTVERSE.
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your shopping journey was completely simulated. Your purchased items are packed and ready.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-[#090D14] border border-white/[0.06] rounded-2xl p-4 text-xs text-slate-300 space-y-2 text-left">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
            <span className="text-slate-400 font-medium">Order Number:</span>
            <span className="font-mono font-black text-blue-400 text-sm">
              #{completedOrderNumber || completedOrder?.orderNumber || 'MV' + Date.now().toString().slice(-8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SIMULATED_SUCCESS (Demo Mode)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Exit Turnstile Sensor:</span>
            <span className="font-bold text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Cleared & Unlocked
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowInvoiceDetails(true)}
            className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs border border-white/[0.08] transition-all"
          >
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>View Order Details & Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleShopAgain}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 text-sm active:scale-95 transition-all uppercase tracking-wider btn-shine border border-blue-400/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Walk In & Shop Again</span>
          </button>
        </div>

        {/* Digital Receipt Breakdown Sub-modal */}
        {showInvoiceDetails && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4 max-h-[85vh] flex flex-col border border-white/[0.08] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-400" />
                  <h3 className="font-extrabold text-white text-sm">Martverse Official Receipt</h3>
                </div>
                <button
                  onClick={() => setShowInvoiceDetails(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
                <div className="bg-[#090D14] p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <div className="text-slate-400">Order: <strong className="text-white font-mono">#{completedOrder?.orderNumber}</strong></div>
                  <div className="text-slate-400">Customer: <strong className="text-white">{completedOrder?.customerName}</strong></div>
                  <div className="text-slate-400">Date: <span className="text-slate-300 font-mono">{completedOrder?.dateTime}</span></div>
                  <div className="text-slate-400">Status: <span className="text-emerald-400 font-bold">{completedOrder?.paymentStatus}</span></div>
                </div>

                <div className="divide-y divide-white/[0.06] bg-[#090D14] p-3 rounded-xl border border-white/[0.06]">
                  <div className="font-bold text-slate-400 pb-2 text-[11px] uppercase">Purchased Items</div>
                  {completedOrder?.items && completedOrder.items.length > 0 ? (
                    completedOrder.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center text-[11px]">
                        <div>
                          <div className="font-bold text-white">{it.productName}</div>
                          <div className="text-slate-400">Qty: {it.quantity} x ₹{it.unitPrice}</div>
                        </div>
                        <div className="font-bold text-slate-200">₹{it.lineTotal}</div>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 text-slate-400 text-xs">
                      All products recorded and inventory updated in database.
                    </div>
                  )}
                </div>

                <div className="bg-[#090D14] p-3 rounded-xl border border-white/[0.06] space-y-1.5 font-bold">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-white">₹{completedOrder?.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee:</span>
                    <span className="text-emerald-400">{completedOrder?.deliveryCharge === 0 ? 'FREE' : `₹${completedOrder?.deliveryCharge}`}</span>
                  </div>
                  <div className="flex justify-between text-white text-sm pt-1 border-t border-white/[0.08]">
                    <span>Total Paid (Demo):</span>
                    <span className="text-blue-400">₹{completedOrder?.finalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/[0.08]"
              >
                <Printer className="w-4 h-4" /> Print Digital Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
