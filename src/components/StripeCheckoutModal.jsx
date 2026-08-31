import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import ItemThumbnail from "./ItemThumbnail";
import { analyticsService } from "../services/analyticsService";

// Simulates loading Stripe for real-money checkout
import { loadStripe } from '@stripe/stripe-js';

export default function StripeCheckoutModal({ isOpen, onClose, packageInfo, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && packageInfo) {
      setLoading(false);
      setError(null);
      if (packageInfo.isSubscription) {
        analyticsService.logBeginCheckout(packageInfo.id);
      } else {
        analyticsService.logCustomEvent('begin_checkout_sparks', {
          item_id: packageInfo.id,
          item_name: packageInfo.name,
          price: packageInfo.price
        });
      }
    }
  }, [isOpen, packageInfo]);

  if (!isOpen || !packageInfo) return null;

  const handleCheckout = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError("Internet connection required for secure real-money purchases. Please reconnect to Wi-Fi or data.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Initialize Stripe with a test publishable key (or inject from env vars later)
      // For now, we mock the success flow since we don't have a backend to create checkout sessions
      const stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // Simulate network request to backend for checkout session
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, we would redirect to Stripe Checkout here:
      // await stripe.redirectToCheckout({ sessionId: "..." });

      // For now, we immediately confirm success
      if (packageInfo.isSubscription) {
        analyticsService.logPurchase(packageInfo.id);
      } else {
        analyticsService.logCustomEvent('purchase_sparks', {
          item_id: packageInfo.id,
          item_name: packageInfo.name,
          price: packageInfo.price
        });
      }
      onConfirm(packageInfo);
    } catch (e) {
      console.error("Checkout failed:", e);
      setError("Failed to initialize secure checkout. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div
      onClick={!loading ? onClose : undefined}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in ${!loading ? 'cursor-pointer' : ''}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white border-4 border-indigo-500 rounded-3xl p-5 text-center shadow-2xl relative max-h-[85vh] overflow-y-auto animate-pop cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          disabled={loading}
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <ItemThumbnail
          itemId={packageInfo.id}
          rarity={packageInfo.rarity || 'legendary'}
          className="w-16 h-16 mx-auto mb-4 shadow-md"
        />

        <h3 className="text-xl font-extrabold text-slate-800 mb-1">Secure Checkout</h3>
        <p className="text-sm text-slate-500 font-medium mb-4">
          Do you want to buy <strong>{packageInfo.name}</strong> for <strong>{packageInfo.price}</strong>?
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200 mb-4 flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Item</span>
            <span className="block text-sm font-black text-slate-800">{packageInfo.name}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Price</span>
            <span className="block text-sm font-black text-slate-800">{packageInfo.price}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {loading ? 'Processing...' : `Pay ${packageInfo.price}`}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-slate-500 font-extrabold text-sm hover:text-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span>🔒</span>
          <span>Secured by Stripe</span>
        </div>
      </div>
    </div>
  );
}
