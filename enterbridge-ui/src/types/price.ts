import type { Product } from './product';

// Mirrors PriceDto returned by GET /api/prices/history/{productId}
export interface Price {
  id: number;
  amount: number;
  dateTime: string;      // ISO 8601 string — convert to Date when displaying
  quantity: number;
  unitOfMeasure: string;
  productId: number;
  product?: Product;
}
