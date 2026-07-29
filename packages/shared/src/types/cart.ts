export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartLineItem extends CartItem {
  name: string;
  unitPrice: number;
  lineTotal: number;
  availability: "in_stock" | "out_of_stock";
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CartView {
  sessionId: string;
  items: CartLineItem[];
  subtotal: number;
}
