import { useEffect, useState } from 'react';
import { getAllProducts, getPriceHistory } from '../api/apiService';
import type { Product } from '../types/product';
import type { Price } from '../types/price';

type LatestPriceSnapshot = Pick<Price, 'amount' | 'quantity' | 'unitOfMeasure' | 'dateTime'>;

function groupByCategory(products: Product[]): Record<string, Product[]> {
  return products.reduce<Record<string, Product[]>>((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestPriceByProductId, setLatestPriceByProductId] = useState<Record<number, LatestPriceSnapshot | null>>({});
  const [priceLoadingByProductId, setPriceLoadingByProductId] = useState<Record<number, boolean>>({});
  const [priceErrorByProductId, setPriceErrorByProductId] = useState<Record<number, string>>({});

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const loadLatestPrice = async (productId: number) => {
    if (productId in latestPriceByProductId || priceLoadingByProductId[productId]) return;

    setPriceLoadingByProductId((prev) => ({ ...prev, [productId]: true }));
    setPriceErrorByProductId((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    try {
      const endDate = new Date().toISOString().slice(0, 10);
      const history = await getPriceHistory(productId, '2022-01-01', endDate);

      const latest = history.items.length > 0 ? history.items[history.items.length - 1] : null;

      setLatestPriceByProductId((prev) => ({
        ...prev,
        [productId]: latest
          ? {
              amount: latest.amount,
              quantity: latest.quantity,
              unitOfMeasure: latest.unitOfMeasure,
              dateTime: latest.dateTime,
            }
          : null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load price';
      setPriceErrorByProductId((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPriceLoadingByProductId((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (products.length === 0) return <p>No products found.</p>;

  const grouped = groupByCategory(products);
  const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <h1>Products</h1>
      <p>{products.length} products</p>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {sortedCategories.map((category) => (
          <details
            key={category}
            style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 0.75rem' }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              {category} ({grouped[category].length})
            </summary>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Name</th>
                  <th style={{ padding: '0.5rem' }}>SKU</th>
                  <th style={{ padding: '0.5rem' }}>Description</th>
                  <th style={{ padding: '0.5rem' }}>Latest Price</th>
                </tr>
              </thead>
              <tbody>
                {grouped[category].map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{product.name}</td>
                    <td style={{ padding: '0.5rem' }}>{product.sku}</td>
                    <td style={{ padding: '0.5rem' }}>{product.description}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {priceErrorByProductId[product.id] ? (
                        <span style={{ color: 'red' }}>{priceErrorByProductId[product.id]}</span>
                      ) : priceLoadingByProductId[product.id] ? (
                        <span>Loading price...</span>
                      ) : product.id in latestPriceByProductId ? (
                        latestPriceByProductId[product.id] ? (
                          <span>
                            ${latestPriceByProductId[product.id]!.amount.toFixed(2)} / {latestPriceByProductId[product.id]!.quantity}{' '}
                            {latestPriceByProductId[product.id]!.unitOfMeasure}
                            <br />
                            <small>{new Date(latestPriceByProductId[product.id]!.dateTime).toLocaleDateString()}</small>
                          </span>
                        ) : (
                          <span>No price history</span>
                        )
                      ) : (
                        <button onClick={() => loadLatestPrice(product.id)}>Load latest price</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </div>
    </div>
  );
}
