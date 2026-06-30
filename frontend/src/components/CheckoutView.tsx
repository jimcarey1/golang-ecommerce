import React, { useState } from "react";
import { ShoppingBag, ArrowLeft, ShieldCheck, Mail, Phone, Lock, AlertCircle, RefreshCw, Key } from "lucide-react";
import type { Order } from "../types.ts";
import type { Product } from "../services/products.ts";
import { useAuthContext } from "../context/AuthContext.tsx";
import type { AuthUser } from "../services/auth.ts";

interface CheckoutViewProps {
  item: Product;
  onCancel: () => void;
  onCompletePurchase: () => void;
}

export default function CheckoutView({
  item,
  onCancel,
  onCompletePurchase,
}: CheckoutViewProps) {
  const { user } = useAuthContext()
  if(!user){
    return null
  }
  return (
    <AuthenticatedCheckoutView
      item={item}
      currentUser={user}
      onCancel={onCancel}
      onCompletePurchase={onCompletePurchase}
    />
  );
}

type AuthenticatedCheckoutViewProps = Omit<CheckoutViewProps, "currentUser"> & {
  currentUser: AuthUser;
};

function AuthenticatedCheckoutView({
  item,
  currentUser,
  onCancel,
  onCompletePurchase,
}: AuthenticatedCheckoutViewProps) {
  const user = currentUser;

  // Local state variables for checkout processing states
  const [verifiedVia, setVerifiedVia] = useState<"email" | "phone">("email");
  const [verifiedContact, setVerifiedContact] = useState(
    verifiedVia === "email" ? user.Email : "91"
  );
  const [submittingSetup, setSubmittingSetup] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);

  // OTP Validation stage state
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<Order | null>(null);

  // Temporary Solution
  const hasAddress = true
  const hasPayment = true

  // Handle contact type toggle
  function handleToggleVia(type: "email" | "phone") {
    setVerifiedVia(type);
    if (type === "email") {
      setVerifiedContact(user.Email);
    } else {
      setVerifiedContact("");
    }
  }

  // Phase 1: Initialize Razorpay Checkout Order
  async function handleInitializePayment(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingSetup(true);
    setValidationError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.ID}`,
        },
        body: JSON.stringify({
          itemId: item.ID,
          verifiedVia,
          verifiedContact,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Initialization failed to trigger.");
        return;
      }

      setOrderId(data.orderId);
      setRazorpayOrderId(data.razorpayOrderId);
      setOtpDebugCode(data.otpDebugCode);
      setShowRzpModal(true); // Launch simulated Razorpay modal overlay!
    } catch (err) {
      console.error(err);
      setValidationError("Failed to communicate with Razorpay. Try again.");
    } finally {
      setSubmittingSetup(false);
    }
  }

  // Phase 2: Verify OTP via server
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode) {
      setValidationError("Verification OTP code cannot be empty.");
      return;
    }

    setVerifyingOtp(true);
    setValidationError("");

    try {
      const res = await fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.ID}`,
        },
        body: JSON.stringify({
          orderId,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Incorrect OTP verification code block.");
        return;
      }

      setReceiptDetails(data.order);
      setPurchaseSuccess(true);
      setShowRzpModal(false);
    } catch (err) {
      console.error(err);
      setValidationError("Network timed out. Please input details again.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Back button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Product Listing</span>
      </button>

      {/* Main split: Order summary left, Payment Form right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Checkout item summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShoppingBag className="h-4 w-4 text-[#0064d2]" />
            <h3 className="text-sm font-bold text-gray-900">Checkout Item Summary</h3>
          </div>

          <div className="flex gap-3">
            <img
              src={item.Images[0]}
              alt={item.ProductName}
              className="h-16 w-16 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
            />
            <div>
              <span className="text-[9px] font-bold text-[#0064d2] bg-[#0064d2]/10 px-1.5 py-0.5 rounded uppercase">
                {item.SubCategoryID}
              </span>
              <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-1 leading-tight">{item.ProductName}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Seller: Seller Name</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>EBay Purchase Price</span>
              <span className="font-bold text-gray-900">${item.Price.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span>Razorpay Service Fees</span>
              <span className="text-green-600 font-bold">FREE ($0.00)</span>
            </div>

            <div className="border-t border-gray-150 pt-2 flex justify-between text-sm font-black text-gray-950">
              <span>Total Charge ($)</span>
              <span>${item.Price.toLocaleString()}</span>
            </div>
          </div>

          {/* User Dest Address confirmation summary */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-2">
            <span className="block text-[10px] font-black uppercase text-gray-500 tracking-wider">Shipping Destination</span>
            <p className="text-xs text-gray-700 leading-normal font-medium">{"No address added."}</p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 justify-center">
            <Lock className="h-3 w-3 text-green-600" />
            <span>Encrypted SSL Secure Checkout Connection</span>
          </div>
        </div>

        {/* Right Column: Checkout forms / Payment success */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          
          {purchaseSuccess && receiptDetails ? (
            /* SUCCESS CASE RENDERING */
            <div className="text-center space-y-5 py-4 animate-fade-in">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck className="h-7 w-7" />
              </div>
              
              <div>
                <h3 className="text-base font-black text-green-950 uppercase tracking-tight">Payment Completed</h3>
                <p className="text-xs text-gray-500 mt-1">Simulated Razorpay charge authorized with dual-factor OTP confirmation.</p>
              </div>

              {/* Receipt metrics */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-[11px] text-left text-gray-600 space-y-1.5">
                <div><span className="text-gray-400">Razorpay Order ID:</span> {receiptDetails.paymentDetails.razorpayOrderId}</div>
                <div><span className="text-gray-450">Razorpay Payment ID:</span> {receiptDetails.paymentDetails.razorpayPaymentId}</div>
                <div><span className="text-gray-450">Contact Verified Via:</span> {receiptDetails.paymentDetails.verifiedVia} ({receiptDetails.paymentDetails.verifiedContact})</div>
                <div><span className="text-gray-450">Verified status:</span> <span className="text-green-600 font-bold border border-green-200 bg-green-50 px-1.5 rounded uppercase">OTP_VERIFIED</span></div>
                <div className="border-t border-gray-200 pt-1.5 mt-2 flex justify-between font-sans text-xs font-bold text-gray-950">
                  <span>Authorized Charge:</span>
                  <span>${receiptDetails.itemPrice}</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-amber-800 bg-amber-50 rounded p-2 text-left leading-normal border border-amber-200 mb-4 font-medium">
                  <strong>Notification Alert:</strong> A status update email confirming purchase and shipping instructions was sent immediately to both your inbox and the seller's dashboard.
                </p>

                <button
                  onClick={onCompletePurchase}
                  className="rounded-lg bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-850 active:scale-97 cursor-pointer w-full"
                >
                  Go to Purchase History
                </button>
              </div>
            </div>
          ) : (
            /* STAGE 1 FORM: CHOOSE OTP CHANNEL AND DISPATCH ORDER */
            <div className="space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">Authorize Razorpay Verification</h4>
                <p className="text-xs text-gray-500 mt-0.5">Choose your OTP verification channel below.</p>
              </div>

              {validationError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-semibold">
                  ⚠️ {validationError}
                </div>
              )}

              {/* Guard verification check warning */}
              {(!hasAddress || !hasPayment) ? (
                <div className="rounded-lg bg-red-50 p-4 text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-xs text-red-800 leading-normal font-bold">
                    You do not have a registered billing profile. Complete your profile coordinates first.
                  </p>
                  <button
                    onClick={onCancel}
                    className="rounded bg-black text-white py-1.5 px-4 text-xs font-bold text-white hover:bg-gray-850"
                  >
                    Go Back & Update Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInitializePayment} className="space-y-4">
                  
                  {/* Select email or phone layout widgets */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Authentication Notification Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVia("email")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition ${
                          verifiedVia === "email"
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-gray-250 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Confirm Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleVia("phone")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition ${
                          verifiedVia === "phone"
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-gray-250 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Phone className="h-4 w-4" />
                        <span>Confirm Phone</span>
                      </button>
                    </div>
                  </div>

                  {/* Input field for contact validation */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1">
                      {verifiedVia === "email" ? "Auth Email Address" : "Indian Mobile Number"}
                    </label>
                    <input
                      type={verifiedVia === "email" ? "email" : "tel"}
                      required
                      placeholder={verifiedVia === "email" ? "name@email.com" : "e.g. 91 9876543210"}
                      value={verifiedContact}
                      onChange={(e) => setVerifiedContact(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 Focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                      We will dispatch a secure 6-digit transaction authorization pin to verify your Razorpay transaction instantly.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSetup}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0064d2] px-4 py-3 text-xs font-black text-white hover:bg-[#0051ab] transition shadow-xs cursor-pointer"
                  >
                    {submittingSetup ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Connecting Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Authorize Razorpay Payment</span>
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RAZORPAY CUSTOM STYLED SIMULATOR DIALOG OVERLAY */}
      {showRzpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-200">
            
            {/* Razorpay Blue Header */}
            <div className="bg-[#1c2c54] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  RP
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Razorpay Gateway</h4>
                  <span className="text-[9px] text-gray-400">Order Ref: {razorpayOrderId}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[8px] uppercase tracking-widest text-gray-400">Payable amount</span>
                <span className="text-sm font-black text-green-300">${item.Price}</span>
              </div>
            </div>

            {/* OTP Input Fields Area */}
            <div className="p-5 space-y-4">
              
              <div className="text-center space-y-1.5">
                <div className="mx-auto h-9 w-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-200">
                  <Key className="h-4 w-4" />
                </div>
                <h5 className="text-xs font-black text-gray-800 uppercase tracking-tight">Enterprise OTP Authentication</h5>
                <p className="text-[11px] text-gray-500 leading-snug">
                  6-digit transaction PIN dispatched to **{verifiedContact}** via secure simulated gateways.
                </p>
              </div>

              {validationError && (
                <div className="rounded bg-red-50 p-2 text-center text-[10px] text-red-700 font-bold border border-red-200">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded border-2 border-gray-300 text-center tracking-widest px-3 py-2 text-sm text-gray-900 font-black focus:border-[#0064d2]"
                  />
                </div>

                {otpDebugCode && (
                  <div className="rounded-md bg-blue-50/50 p-2 text-center text-[10px] text-[#0064d2] border border-blue-200 font-medium">
                    🔍 Testing Help Code: <strong className="font-mono text-xs text-indigo-700 select-all">{otpDebugCode}</strong>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRzpModal(false)}
                    className="flex-1 rounded border border-gray-250 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel Payer Close
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="flex-1 rounded bg-[#0064d2] text-white py-2 text-xs font-black hover:bg-[#0051ab] transition flex items-center justify-center gap-1"
                  >
                    {verifyingOtp ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify Charge</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center text-[9px] text-gray-400 leading-relaxed pt-2 border-t border-gray-150">
                Secured by Razorpay Payments Enterprise Suite. Transaction updates are forwarded automatically to systemic profiles.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
