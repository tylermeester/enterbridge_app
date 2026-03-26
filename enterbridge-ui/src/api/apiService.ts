import type { Product, PaginatedResponse } from '../types/product';
import type { Price } from '../types/price';
import type { Order, CreateOrderRequest } from '../types/order';

// Base URL of the .NET backend API running locally.
// Vite proxying is not configured, so we use the full URL directly.
const BASE_URL = 'http://localhost:5121';

// ─── Products ────────────────────────────────────────────────────────────────

/** Fetch a paginated list of products, with optional category and sort filters. */
export async function getProducts(
  category?: string,
  sortBy?: string,
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sortBy) params.set('sortBy', sortBy);
  params.set('pageNumber', String(pageNumber));
  params.set('pageSize', String(pageSize));

  const res = await fetch(`${BASE_URL}/api/products?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

/**
 * Fetches all products by traversing every page from the backend pagination response.
 * Durable when product counts grow beyond a single page.
 */
export async function getAllProducts(
  category?: string,
  sortBy?: string,
  pageSize: number = 200
): Promise<Product[]> {
  const firstPage = await getProducts(category, sortBy, 1, pageSize);
  const allItems: Product[] = [...firstPage.items];

  let currentPage = firstPage.pageNumber;
  while (currentPage < firstPage.totalPages) {
    currentPage += 1;
    const page = await getProducts(category, sortBy, currentPage, pageSize);
    allItems.push(...page.items);
  }

  return allItems;
}

/** Fetch a single product by its id. */
export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  return res.json();
}

// ─── Prices ──────────────────────────────────────────────────────────────────

/** Fetch full price history for a product in the given date range. */
export async function getPriceHistory(
  productId: number,
  startDate: string,   // format: YYYY-MM-DD
  endDate: string      // format: YYYY-MM-DD
): Promise<PaginatedResponse<Price>> {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`${BASE_URL}/api/prices/history/${productId}?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch price history: ${res.status}`);
  return res.json();
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/** Fetch all orders stored in the local database. */
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/api/orders`);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json();
}

/** Fetch a single order by its id. */
export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch order ${id}: ${res.status}`);
  return res.json();
}

/** Create a new order and persist it to the local database. */
export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
  return res.json();
}
