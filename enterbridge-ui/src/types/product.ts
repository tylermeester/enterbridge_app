// Mirrors ProductDto returned by GET /api/products and GET /api/products/{id}
export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: string;
}

// Generic paginated wrapper — reused for both product and price list responses
export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: T[];
}
