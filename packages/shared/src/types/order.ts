export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "payment_failed";

export type PaymentStatus =
  | "requires_confirmation"
  | "paid"
  | "failed";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  state?: string;
  country?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  shippingAddress: ShippingAddress;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  sessionId: string;
  status: OrderStatus;
  items: OrderItem[];
  amount: number;
  customer: OrderCustomer;
  createdAt: string;
  paidAt?: string;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
}
