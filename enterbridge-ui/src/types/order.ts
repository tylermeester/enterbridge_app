// Mirrors OrderLine entity stored in local SQLite DB
export interface OrderLine {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  priceEffectiveDate: string;   // ISO 8601 string
}

// Mirrors Order entity stored in local SQLite DB
export interface Order {
  id: number;
  createdAt: string;            // ISO 8601 string
  createdBy: string;
  lines: OrderLine[];
}

// Request body for POST /api/orders
export interface CreateOrderLineRequest {
  productId: number;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  priceEffectiveDate: string;
}

export interface CreateOrderRequest {
  createdBy: string;
  lines: CreateOrderLineRequest[];
}
