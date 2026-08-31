import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import ItemThumbnail from "./ItemThumbnail";
import { analyticsService } from "../services/analyticsService";
import { httpsCallable } from "firebase/functions";
import { signInAnonymously } from "firebase/auth";
import { functions, auth } from "../config/firebase";
import { storageService } from "../services/storageService";

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
      // 1. Call Firebase Cloud Function to create a Checkout Session
      const createCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');

      // Parse the price string (e.g., "$4.99/mo" or "$4.99") to a float amount
      const priceString = packageInfo.realMoneyPrice || packageInfo.price || "0";
      const match = priceString.match(/[\d.]+/);
      const priceAmount = match ? parseFloat(match[0]) : 0;

      const activeProfile = storageService.getActiveProfile();

      // Ensure user is signed in (anonymously if needed)
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const isParentOrigin = packageInfo.source === 'parent_dashboard' || packageInfo.isSubscription || packageInfo.isFamilyPlan || packageInfo.returnAction === 'parent-dashboard';
      const returnAction = packageInfo.returnAction || (isParentOrigin ? 'parent-dashboard' : packageInfo.source === 'shop' ? 'shop' : '');
      const returnTab = packageInfo.tab || (isParentOrigin ? 'verification' : '');
      const returnHighlight = packageInfo.highlight || (isParentOrigin ? 'family_plan' : '');

      const returnParams = new URLSearchParams();
      if (returnAction) returnParams.set('action', returnAction);
      if (returnTab) returnParams.set('tab', returnTab);
      if (returnHighlight) returnParams.set('highlight', returnHighlight);

      const queryStr = returnParams.toString();
      const successUrl = `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}${queryStr ? `&${queryStr}` : ''}`;
      const cancelUrl = `${window.location.origin}${queryStr ? `?${queryStr}` : ''}`;

      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.setItem('kibo_stripe_return_context', JSON.stringify({
            action: returnAction,
            tab: returnTab,
            highlight: returnHighlight
          }));
        } catch (e) {}
      }

      const response = await createCheckoutSession({
        itemId: packageInfo.id,
        itemName: packageInfo.name,
        priceAmount: priceAmount,
        isSubscription: !!packageInfo.isSubscription || priceString.includes('/'),
        profileId: activeProfile?.id,
        successUrl,
        cancelUrl
      });

      const { sessionId, url } = response.data || {};

      if (url) {
        // Break out of any iframes / overlay contexts and navigate top window
        if (window.top) {
          window.top.location.href = url;
        } else {
          window.location.href = url;
        }
        return;
      }

      if (!sessionId) {
        throw new Error("Failed to create checkout session");
      }

      // 2. Initialize Stripe and redirect to checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        throw stripeError;
      }
    } catch (e) {
      console.error("Checkout failed:", e);
      const msg = e?.message || e?.details || "Failed to initialize secure checkout. Please try again later.";
      setError(msg);
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
