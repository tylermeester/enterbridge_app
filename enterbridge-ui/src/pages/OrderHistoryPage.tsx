import { useEffect, useState } from 'react';
import { getOrders } from '../api/apiService';
import type { Order } from '../types/order';

function getOrderTotal(order: Order): number {
  return order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getOrders()
      .then((orders) => {
        // Always sort newest first (descending by CreatedAt)
        const sorted = [...orders].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Order History</h1>

      <section>
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <p>{orders.length} order(s)</p>
            {orders.map((order) => (
                <details
                  key={order.id}
                  style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 0.75rem' }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                    Order #{order.id} • {order.createdBy} • {new Date(order.createdAt).toLocaleString()} • {order.lines.length} line(s) • ${getOrderTotal(order).toFixed(2)}
                  </summary>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Product ID</th>
                        <th style={{ padding: '0.5rem' }}>Product</th>
                        <th style={{ padding: '0.5rem' }}>Qty</th>
                        <th style={{ padding: '0.5rem' }}>Unit</th>
                        <th style={{ padding: '0.5rem' }}>Unit Price</th>
                        <th style={{ padding: '0.5rem' }}>Line Total</th>
                        <th style={{ padding: '0.5rem' }}>Price Effective</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.lines.map((line) => (
                        <tr key={line.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.5rem' }}>{line.productId}</td>
                          <td style={{ padding: '0.5rem' }}>{line.productName}</td>
                          <td style={{ padding: '0.5rem' }}>{line.quantity}</td>
                          <td style={{ padding: '0.5rem' }}>{line.unitOfMeasure}</td>
                          <td style={{ padding: '0.5rem' }}>${line.unitPrice.toFixed(2)}</td>
                          <td style={{ padding: '0.5rem' }}>${(line.unitPrice * line.quantity).toFixed(2)}</td>
                          <td style={{ padding: '0.5rem' }}>{new Date(line.priceEffectiveDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
