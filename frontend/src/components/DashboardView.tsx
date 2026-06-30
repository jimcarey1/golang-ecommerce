import React, { useState, useEffect } from "react";
import { TrendingUp, Package, Truck, MessageSquare, Bookmark, DollarSign, RefreshCw } from "lucide-react";
import type { Item, Order } from "../types.ts";
import type { AuthUser as UserType } from "../services/auth.ts";

interface DashboardViewProps {
  currentUser: UserType | null;
  onSwitchTab: (tab: string) => void;
  onSelectChatForOrder: (orderId: string) => void;
}

export default function DashboardView({
  currentUser,
  onSwitchTab,
  onSelectChatForOrder,
}: DashboardViewProps) {
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <TrendingUp className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Sales Dashboard Offline</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Please log in to manage your listed inventory, coordinate shipments, track item payments, and message buyers.</p>
      </div>
    );
  }

  return (
    <AuthenticatedDashboardView
      currentUser={currentUser}
      onSwitchTab={onSwitchTab}
      onSelectChatForOrder={onSelectChatForOrder}
    />
  );
}

type AuthenticatedDashboardViewProps = Omit<DashboardViewProps, "currentUser"> & {
  currentUser: UserType;
};

function AuthenticatedDashboardView({
  currentUser,
  onSwitchTab,
  onSelectChatForOrder,
}: AuthenticatedDashboardViewProps) {
  const user = currentUser;
  const userId = user.ID;

  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Form Fields per-order update state
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("FedEx");
  const [statusVal, setStatusVal] = useState<Order['status']>("shipping");
  const [updatingShipment, setUpdatingShipment] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user.ID]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Get raw items
      const itemsRes = await fetch("/api/items", {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      if (itemsRes.ok) {
        const allItems: Item[] = await itemsRes.json();
        // filter owned by current user
        const selfItems = allItems.filter((i) => i.sellerId === userId);
        setItems(selfItems);
      }

      // 2. Get incoming sales orders
      const salesRes = await fetch("/api/seller/orders", {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setOrders(salesData);
      }
    } catch (e) {
      console.error("Failed to load seller dashboard details:", e);
    } finally {
      setLoading(false);
    }
  }

  // Handle active status, carrier and tracking edits on the orders
  async function handleUpdateShipping(e: React.FormEvent, orderId: string) {
    e.preventDefault();
    setUpdatingShipment(true);
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/orders/${orderId}/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.ID}`,
        },
        body: JSON.stringify({
          status: statusVal,
          trackingNumber: trackingNumber.trim() || undefined,
          carrier: carrier,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Success! Tracking synchronized. Alert dispatched to buyer inbox.");
        // refresh dashboard data
        await fetchDashboardData();
        setTimeout(() => {
          setSuccessMsg("");
          setActiveOrderId(null);
        }, 3000);
      } else {
        const error = await res.json();
        alert(error.error || "Update operation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network discrepancy. Update was rejected.");
    } finally {
      setUpdatingShipment(false);
    }
  }

  // Pre-fill fields when selecting an order to manage
  function selectOrderToEdit(o: Order) {
    setActiveOrderId(o.id);
    setTrackingNumber(o.trackingNumber || "");
    setCarrier(o.carrier || "FedEx");
    setStatusVal(o.status);
  }

  // Statistics calculation
  const totalSalesCount = orders.filter((o) => o.status !== "cancelled").length;
  const pendingShipCount = orders.filter((o) => o.status === "paid" || o.status === "shipping").length;
  const completedSalesVal = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.itemPrice, 0);

  return (
    <div className="space-y-8">
      
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">My listed inventory</span>
            <span className="text-xl font-black text-gray-900">{items.length} slots</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">Incoming order list</span>
            <span className="text-xl font-black text-gray-900">{totalSalesCount} sold</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">Awaiting Shipment</span>
            <span className="text-xl font-black text-[#e53238]">{pendingShipCount} packages</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase">Total Net Earnings</span>
            <span className="text-xl font-black text-green-700">${completedSalesVal.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Main dashboard columns split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle - Incoming Purchase Orders list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Buyer Sales & Shipping Control</h2>
                <p className="text-xs text-gray-500">Monitor custom checkout approvals and coordinate package fulfillment details.</p>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0064d2] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-gray-400">Synchronizing database orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center rounded-lg border-2 border-dashed border-gray-200">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-700">No Sales Registered Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  When a buyer checks out one of your active listings and validates OTP, the order metadata references will appear here immediately!
                </p>
                <button
                  onClick={() => onSwitchTab("sell")}
                  className="mt-4 rounded-lg bg-[#0064d2] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0051ab]"
                >
                  List More Items For Sale
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => {
                  const isPendingShipping = o.status === "paid" || o.status === "shipping" || o.status === "shipped";
                  const isEditingThisOrder = activeOrderId === o.id;

                  return (
                    <div
                      key={o.id}
                      className={`rounded-xl border p-5 transition duration-150 ${
                        isEditingThisOrder 
                          ? "border-[#0064d2] bg-blue-50/20 ring-1 ring-[#0064d2]" 
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {/* Product Header details */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans pb-3 border-b border-gray-100">
                        <div className="flex gap-3">
                          <img
                            src={o.itemImageUrl}
                            alt={o.itemTitle}
                            className="h-14 w-14 rounded object-cover border border-gray-200"
                          />
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{o.id}</span>
                            <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{o.itemTitle}</h4>
                            <span className="block text-sm font-black text-gray-950 mt-1">${o.itemPrice}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            o.status === "paid" ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse" :
                            o.status === "shipping" || o.status === "shipped" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                            o.status === "delivered" ? "bg-green-100 text-green-800 border border-green-300" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {o.status === "paid" ? "Paid - Awaiting Shipment" : o.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">Purchased {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Buyer Address & Verification Indicators */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                        <div className="space-y-1">
                          <h5 className="font-bold text-gray-700 uppercase text-[9px] tracking-wider">Courier Destination Address</h5>
                          <p className="text-gray-600 font-medium bg-gray-50 p-2 rounded leading-tight">
                            {o.deliveryAddress}
                          </p>
                          <div className="pt-1.5 flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                            <span className="font-bold text-gray-800">Buyer Profile:</span>
                            <span>{o.buyerName}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-gray-700 uppercase text-[9px] tracking-wider">Razorpay Payment Metadata</h5>
                          <div className="bg-gray-50 p-2 rounded font-mono text-[10px] text-gray-600 space-y-1">
                            <div><span className="text-gray-400">Order ID:</span> {o.paymentDetails.razorpayOrderId}</div>
                            {o.paymentDetails.razorpayPaymentId && (
                              <div><span className="text-gray-400">Payment ID:</span> {o.paymentDetails.razorpayPaymentId}</div>
                            )}
                            <div className="flex items-center gap-1 pt-1 mt-1 border-t border-gray-200">
                              <span className="text-[9px] font-bold uppercase rounded-sm px-1.5 py-0.5 bg-green-50 text-green-700">
                                Verified via {o.paymentDetails.verifiedVia}
                              </span>
                              <span className="truncate max-w-[150px]">{o.paymentDetails.verifiedContact}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectChatForOrder(o.id)}
                            className="flex items-center gap-1 rounded bg-black/5 hover:bg-black/10 px-3 py-1.5 text-xs font-bold text-gray-800 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#0064d2]" />
                            <span>Chat with Buyer</span>
                          </button>
                        </div>

                        {isPendingShipping && (
                          <div className="flex items-center gap-2">
                            {isEditingThisOrder ? (
                              <button
                                onClick={() => setActiveOrderId(null)}
                                className="text-xs font-semibold text-gray-500 hover:underline"
                              >
                                Close Form
                              </button>
                            ) : (
                              <button
                                onClick={() => selectOrderToEdit(o)}
                                className="rounded-lg bg-[#0064d2] px-4.5 py-1.5 text-xs font-bold text-white hover:bg-[#0051ab] active:scale-97 transition"
                              >
                                Configure Shipping Track
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded Shipping Form stage */}
                      {isEditingThisOrder && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-250 animate-fade-in">
                          <h4 className="text-xs font-black uppercase text-[#0064d2] tracking-wider mb-3">Update Order Shipment Tracking</h4>
                          
                          {successMsg && (
                            <div className="mb-3 rounded-md bg-green-50 border border-green-300 p-2.5 text-xs text-green-700 font-semibold">
                              ✓ {successMsg}
                            </div>
                          )}

                          <form onSubmit={(e) => handleUpdateShipping(e, o.id)} className="space-y-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-gray-500 font-medium mb-1">Carrier Agency</label>
                                <select
                                  value={carrier}
                                  onChange={(e) => setCarrier(e.target.value)}
                                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs text-gray-800"
                                >
                                  <option value="FedEx">FedEx Express</option>
                                  <option value="DHL">DHL Worldwide</option>
                                  <option value="UPS">UPS Saver</option>
                                  <option value="Blue Dart">Blue Dart Express</option>
                                  <option value="Indian Speed Post">Speed Post (EMS)</option>
                                  <option value="DTDC Courier">DTDC Express</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-gray-500 font-medium mb-1">Tracking Number</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. FDX-1294863"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs text-gray-800"
                                />
                              </div>

                              <div>
                                <label className="block text-gray-500 font-medium mb-1">Fulfillment State</label>
                                <select
                                  value={statusVal}
                                  onChange={(e) => setStatusVal(e.target.value as Order['status'])}
                                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs font-bold text-gray-800"
                                >
                                  <option value="shipping">Initiating Package Packaging</option>
                                  <option value="shipped">Shipped & In Transit</option>
                                  <option value="delivered">Arrived / Delivered</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                              <button
                                type="button"
                                onClick={() => setActiveOrderId(null)}
                                className="rounded px-4 py-2 bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={updatingShipment}
                                className="rounded px-5 py-2 bg-black hover:bg-gray-850 text-white font-bold"
                              >
                                {updatingShipment ? "Saving Records..." : "Transmit Track Update"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Manage Listed Stock items */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              My Active Listings ({items.length})
            </h3>
            
            {items.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                You do not have any items listed in the database.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-2.5 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                    <img
                      src={i.imageUrl}
                      alt={i.title}
                      className="h-11 w-11 rounded object-cover border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-gray-800 truncate">{i.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-gray-900">${i.price}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          i.status === "active" ? "bg-green-50 text-green-700 border border-green-100" :
                          i.status === "sold" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {i.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-150 bg-blue-50/20 p-4 font-mono text-[11px] text-gray-600 space-y-2">
            <span className="font-sans font-bold text-gray-700 uppercase text-[9px] tracking-wider block">Fulfillment Rule Book</span>
            <p className="leading-relaxed">
              Upon setting tracking state to <strong>"Shipped"</strong> or <strong>"Delivered"</strong>, our backend automatically transmits high-prioritized inbox notification updates to the buyer account. No manual paper documentation required. All communications should stay inside the secured chat lines.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
