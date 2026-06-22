import type { AuthUser } from "./services/auth";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  address?: string;
  paymentDetails?: {
    upiId?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardHolder?: string;
  };
}

export type ItemStatus = 'active' | 'sold' | 'shipping' | 'completed';

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerId: number;
  sellerName: string;
  status: ItemStatus;
  createdAt: string;
}

export type OrderStatus = 'pending_verification' | 'paid' | 'shipping' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  itemImageUrl: string;
  sellerId: number;
  buyerId: number;
  buyerName: string;
  status: OrderStatus;
  deliveryAddress: string;
  paymentDetails: {
    method: 'razorpay';
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    verifiedVia: 'email' | 'phone';
    verifiedContact: string;
  };
  otpCode: string;
  otpVerified: boolean;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerSellerMessage {
  id: string;
  orderId: string;
  itemId: string;
  itemTitle: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'order_status' | 'payment_verification' | 'listing_notif' | 'communication';
  read: boolean;
  createdAt: string;
}


export interface AuthenticatedProfileViewProps {
  currentUser: AuthUser;
  onSwitchTab: (tab: string) => void;
  onSelectChatForOrder: (orderId: string) => void;
}
