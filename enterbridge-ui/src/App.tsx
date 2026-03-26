import { Routes, Route, NavLink } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <nav
        style={{
          padding: '1rem',
          borderBottom: '1px solid #cbd5e1',
          display: 'flex',
          gap: '0.75rem',
          background: '#0f172a',
        }}
      >
        <NavLink
          to="/products"
          style={({ isActive }) => ({
            color: isActive ? '#0f172a' : '#e2e8f0',
            background: isActive ? '#bfdbfe' : 'transparent',
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontWeight: 600,
          })}
        >
          Products
        </NavLink>
        <NavLink
          to="/orders/place"
          style={({ isActive }) => ({
            color: isActive ? '#0f172a' : '#e2e8f0',
            background: isActive ? '#bfdbfe' : 'transparent',
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontWeight: 600,
          })}
        >
          Place Order
        </NavLink>
        <NavLink
          to="/orders/history"
          style={({ isActive }) => ({
            color: isActive ? '#0f172a' : '#e2e8f0',
            background: isActive ? '#bfdbfe' : 'transparent',
            textDecoration: 'none',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontWeight: 600,
          })}
        >
          Order History
        </NavLink>
      </nav>
      <main style={{ padding: '1rem', background: '#f8fafc', flex: 1 }}>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/place" element={<OrdersPage />} />
          <Route path="/orders/history" element={<OrderHistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
