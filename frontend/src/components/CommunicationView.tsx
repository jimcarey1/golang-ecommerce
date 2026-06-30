import React, { useState, useEffect } from "react";
import { Mail, MessageSquare, Send, RefreshCw, Calendar } from "lucide-react";
import type { Notification, Order, BuyerSellerMessage } from "../types.ts";
import type { AuthUser as UserType } from "../services/auth.ts";
import { useAuthContext } from "../context/AuthContext.tsx";

interface CommunicationViewProps {
  selectedOrderId: string | null;
  onClearSelectedOrder: () => void;
}

export default function CommunicationView({
  selectedOrderId,
  onClearSelectedOrder,
}: CommunicationViewProps) {
  const { user } = useAuthContext()
  if (!user) return null;

  return (
    <AuthenticatedCommunicationView
      currentUser={user}
      selectedOrderId={selectedOrderId}
      onClearSelectedOrder={onClearSelectedOrder}
    />
  );
}

type AuthenticatedCommunicationViewProps = Omit<CommunicationViewProps, "currentUser"> & {
  currentUser: UserType;
};

function AuthenticatedCommunicationView({
  currentUser,
  selectedOrderId,
  onClearSelectedOrder,
}: AuthenticatedCommunicationViewProps) {
  const user = currentUser;
  const userId = user.ID;

  const [activeSegment, setActiveSegment] = useState<"inbox" | "chats">("inbox");
  
  // States of automated notification emails
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // States of direct chats
  const [ordersWithChat, setOrdersWithChat] = useState<Order[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(selectedOrderId);
  const [messages, setMessages] = useState<BuyerSellerMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMsgText, setNewMsgText] = useState("");

  useEffect(() => {
    fetchNotifications();
    fetchChatOrders();
  }, [user.ID]);

  useEffect(() => {
    if (activeChatOrderId) {
      fetchMessages(activeChatOrderId);
    }
  }, [activeChatOrderId]);

  // Set the chat window segment automatically when selectedOrderId transitions
  useEffect(() => {
    if (selectedOrderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveChatOrderId(selectedOrderId);
      setActiveSegment("chats");
    }
  }, [selectedOrderId]);

  // Read automated inbox notifications
  async function fetchNotifications() {
    setLoadingNotifs(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  }

  // Clear unread badge
  async function handleMarkAllAsRead() {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.ID}`,
        }
      });
      if (res.ok) {
        // reload notifs
        await fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Read active orders involved in buy/sell loops to populate sidebar chats
  async function fetchChatOrders() {
    try {
      // Get purchases
      const pRes = await fetch("/api/buyer/orders", {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      let purchases: Order[] = [];
      if (pRes.ok) purchases = await pRes.json();

      // Get sales
      const sRes = await fetch("/api/seller/orders", {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      let sales: Order[] = [];
      if (sRes.ok) sales = await sRes.json();

      // Combine orders that have completed Razorpay creation
      const combined = [...purchases, ...sales];
      setOrdersWithChat(combined);

      // Auto-select first order if none active and we have orders
      if (!activeChatOrderId && combined.length > 0) {
        setActiveChatOrderId(combined[0].id);
      }
    } catch (err) {
      console.error("Failed to load correspondence orders list:", err);
    }
  }

  // Read messages back-and-forth
  async function fetchMessages(orderId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/communications/order/${orderId}`, {
        headers: { "Authorization": `Bearer ${user.ID}` }
      });
      if (res.ok) {
        const msgList = await res.json();
        setMessages(msgList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }

  // Transmit messaging text
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsgText.trim() || !activeChatOrderId) return;

    try {
      const res = await fetch("/api/communications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.ID}`,
        },
        body: JSON.stringify({
          orderId: activeChatOrderId,
          content: newMsgText.trim()
        }),
      });

      if (res.ok) {
        setNewMsgText("");
        await fetchMessages(activeChatOrderId);
      } else {
        alert("Denied transmitting messages.");
      }
    } catch (err) {
      console.error(err);
      alert("Transmitting failed. Connection discrepancy.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      
      {/* 1. segment selection tabs */}
      <div className="flex border-b border-gray-250 mb-6">
        
        <button
          onClick={() => setActiveSegment("inbox")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeSegment === "inbox"
              ? "border-[#0064d2] text-[#0064d2] bg-blue-50/10"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          <Mail className="h-4.5 w-4.5" />
          <span>Automated Inbox Alerts ({notifications.filter(n=>!n.read).length})</span>
        </button>

        <button
          onClick={() => setActiveSegment("chats")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeSegment === "chats"
              ? "border-[#0064d2] text-[#0064d2] bg-blue-50/10"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>Buyer/Seller Live Chats ({ordersWithChat.length})</span>
        </button>

      </div>

      {/* SEGMENT 1: AUTOMATED INBOX ALERTS SIMULATOR */}
      {activeSegment === "inbox" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-sans">
                <span>System Notification Dispatch Logs</span>
                <span className="text-[10px] bg-[#0064d2]/10 text-[#0064d2] px-2 py-0.5 rounded-sm">Transactional</span>
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Automated emails matching checkout approvals and courier status updates are compiled here.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-gray-600 hover:text-black bg-white border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer"
              >
                Clear Unread Badges
              </button>
              <button
                onClick={fetchNotifications}
                disabled={loadingNotifs}
                className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingNotifs ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {loadingNotifs ? (
            <div className="py-20 text-center text-xs text-gray-400">Opening secure mailbox...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-xs font-bold text-gray-600">Your email inbox is empty</h3>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                No automation updates have been fired yet. Trigger checkout or update shipment states on orders to send alerts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-150">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 transition hover:bg-gray-50 flex gap-4 ${
                    !n.read ? "bg-blue-50/25 border-l-4 border-l-[#0064d2]" : ""
                  }`}
                >
                  <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center ${
                    n.type === "payment_verification" ? "bg-amber-100 text-amber-700" :
                    n.type === "order_status" ? "bg-blue-100 text-blue-700" :
                    n.type === "communication" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-150 text-gray-700"
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">From: systems@ebay-alert.com</span>
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-red-500" title="Unread status Alert" />
                      )}
                    </h4>

                    <p className="text-xs text-gray-650 leading-relaxed max-w-3xl whitespace-pre-line py-1">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* SEGMENT 2: DIRECT BUYER/SELLER CORRESPONDENCE CHAT */}
      {activeSegment === "chats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs h-[520px]">
          
          {/* Side panel: Transaction selectors list */}
          <div className="border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-black uppercase text-gray-600 tracking-wider">Transaction Chat Logs</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Select order threads below to message participants.</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {ordersWithChat.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No active transactions matched. Buy or sell an item first.
                </div>
              ) : (
                ordersWithChat.map((o) => {
                  const isActive = activeChatOrderId === o.id;
                  const roleLabel = o.buyerId === userId ? "Bought" : "Sold";
                  return (
                    <button
                      key={o.id}
                      onClick={() => {
                        setActiveChatOrderId(o.id);
                        onClearSelectedOrder(); // Clear global trigger once clicked
                      }}
                      className={`w-full p-3.5 text-left transition flex gap-2.5 ${
                        isActive 
                          ? "bg-[#0064d2]/15 border-l-4 border-l-[#0064d2]" 
                          : "hover:bg-gray-100 bg-white"
                      }`}
                    >
                      <img
                        src={o.itemImageUrl}
                        alt={o.itemTitle}
                        className="h-10 w-10 rounded object-cover border border-gray-200 shrink-0 bg-gray-50"
                      />
                      <div className="min-w-0">
                        <span className="text-[8px] font-black uppercase bg-gray-150 px-1.5 py-0.5 rounded text-gray-600">
                          {roleLabel} - {o.status}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 truncate mt-1 leading-tight">{o.itemTitle}</h4>
                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">Ref: {o.id.substring(0, 8)}...</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Panel: Conversation Thread Display */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            
            {activeChatOrderId ? (
              <>
                {/* Active chat title header */}
                <div className="px-5 py-3.5 border-b border-gray-150 flex items-center justify-between bg-white text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Thread Connection: {ordersWithChat.find(o => o.id === activeChatOrderId)?.itemTitle || "Order Chat"}
                    </h4>
                    <span className="text-[10px] text-gray-500">Order ID Coordinate: {activeChatOrderId}</span>
                  </div>
                  <button
                    onClick={() => fetchMessages(activeChatOrderId)}
                    disabled={loadingMessages}
                    className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded"
                    title="Refresh conversation messages manually"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingMessages ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Conversation area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gray-50/40">
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-gray-400">Opening correspondence...</div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No dialogues exchanged. Start by typing a message below.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === String(user.ID);
                      const isSystem = m.senderId === "system_robot";

                      if (isSystem) {
                        return (
                          <div key={m.id} className="mx-auto max-w-sm rounded-lg bg-indigo-50 border border-indigo-150 p-2.5 text-center text-[10px] text-indigo-850 font-mono leading-relaxed">
                            {m.content}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[10px] text-gray-400 font-semibold mb-0.5">{m.senderName}</span>
                          <div className={`rounded-xl px-4 py-2 text-xs leading-normal shadow-xs ${
                            isMe 
                              ? "bg-[#0064d2] text-white rounded-tr-none" 
                              : "bg-white text-gray-800 border border-gray-150 rounded-tl-none"
                          }`}>
                            {m.content}
                          </div>
                          <span className="text-[9px] text-gray-400 mt-0.5">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom send widget */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 flex gap-2 bg-white">
                  <input
                    type="text"
                    required
                    placeholder="Type dispatch messages and shipment coordination files here..."
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-850 focus:ring-1 focus:ring-blue-500 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-black px-4 text-white hover:bg-gray-850 text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                <h4 className="text-xs font-bold text-gray-600">No Thread Picked</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mt-1">
                  Pick a conversation logs list item on the sidebar to inspect order details.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
