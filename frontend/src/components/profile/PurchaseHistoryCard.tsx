import { History, MessageSquare, RefreshCw } from "lucide-react";
import type { Order } from "../../types";

interface PurchaseHistoryCardProps {
  purchases: Order[];
  loadingHistory: boolean;
  onRefresh: () => void;
  onSwitchTab: (tab: string) => void;
  onSelectChatForOrder: (orderId: string) => void;
}

export default function PurchaseHistoryCard({
  purchases,
  loadingHistory,
  onRefresh,
  onSwitchTab,
  onSelectChatForOrder,
}: PurchaseHistoryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-1.5">
          <History className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900">Purchase History</h3>
        </div>

        <button
          onClick={onRefresh}
          disabled={loadingHistory}
          className="text-gray-400 hover:text-black transition"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loadingHistory ? (
        <div className="py-8 text-center text-xs text-gray-400">
          Loading order records...
        </div>
      ) : purchases.length === 0 ? (
        <div className="py-8 text-center">
          <span className="block text-xs text-gray-400">
            No items bought yet.
          </span>

          <button
            onClick={() => onSwitchTab("marketplace")}
            className="text-[11px] font-bold text-[#0064d2] hover:underline mt-1.5"
          >
            Browse Marketplace →
          </button>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {purchases.map((order) => (
            <PurchaseHistoryItem
              key={order.id}
              order={order}
              onSelectChatForOrder={onSelectChatForOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PurchaseHistoryItem({
  order,
  onSelectChatForOrder,
}: {
  order: Order;
  onSelectChatForOrder: (orderId: string) => void;
}) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50 transition">
      <img
        src={order.itemImageUrl}
        alt={order.itemTitle}
        className="h-12 w-12 rounded object-cover border border-gray-200 bg-gray-50 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-900 truncate">
          {order.itemTitle}
        </h4>

        <span className="block text-[11px] font-black text-gray-950 mt-0.5">
          ${order.itemPrice}
        </span>

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
          <span className={getOrderStatusClassName(order.status)}>
            {order.status}
          </span>

          <button
            onClick={() => onSelectChatForOrder(order.id)}
            className="flex items-center gap-1 text-[10px] font-bold text-[#0064d2] hover:underline"
            title="Open Buyer-Seller Chat thread"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Chat</span>
          </button>
        </div>

        {order.trackingNumber && (
          <div className="mt-1.5 text-[9px] bg-sky-50 text-sky-800 p-1 rounded font-mono">
            Tracking: {order.carrier} - {order.trackingNumber}
          </div>
        )}
      </div>
    </div>
  );
}

function getOrderStatusClassName(status: string) {
  const base = "text-[9px] font-black uppercase px-2 py-0.5 rounded";

  if (status === "paid") {
    return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
  }

  if (status === "shipping" || status === "shipped") {
    return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
  }

  if (status === "delivered") {
    return `${base} bg-green-50 text-green-700 border border-green-200`;
  }

  return `${base} bg-gray-50 text-gray-600`;
}