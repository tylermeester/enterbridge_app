import { useEffect, useState } from 'react';
import { createOrder, getAllProducts, getOrders, getPriceHistory } from '../api/apiService';
import type { CreateOrderLineRequest } from '../types/order';
import type { Product } from '../types/product';

type DraftLine = {
  productId: string;
  productName: string;
  productSku: string;
  quantity: string;
  unitOfMeasure: string;
  unitPrice: string;
  priceEffectiveDate: string;
  priceBasisNote: string;
};

function createEmptyLine(): DraftLine {
  return {
    productId: '',
    productName: '',
    productSku: '',
    quantity: '1',
    unitOfMeasure: 'Each',
    unitPrice: '',
    priceEffectiveDate: new Date().toISOString().slice(0, 10),
    priceBasisNote: '',
  };
}

function getDraftLineTotal(line: DraftLine): number {
  const quantity = Number(line.quantity);
  const unitPrice = Number(line.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0;
  return quantity * unitPrice;
}

export default function OrdersPage() {
  const [createdBy, setCreatedBy] = useState('');
  const [nextOrderNumber, setNextOrderNumber] = useState<number | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([createEmptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLineIndex, setPickerLineIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [lineLoading, setLineLoading] = useState<Record<number, boolean>>({});

  const readOnlyInputStyle = {
    background: '#e2e8f0',
    color: '#334155',
    borderColor: '#cbd5e1',
    cursor: 'not-allowed',
  } as const;

  const updateLine = (index: number, patch: Partial<DraftLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => {
    setLines((prev) => [...prev, createEmptyLine()]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) {
      setLines([createEmptyLine()]);
    } else {
      setLines((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const openPicker = async (lineIndex: number) => {
    setPickerLineIndex(lineIndex);
    setPickerSearch('');
    setPickerOpen(true);
    if (!allProducts && !loadingProducts) {
      setLoadingProducts(true);
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  const selectProduct = async (product: Product) => {
    if (pickerLineIndex === null) return;
    const idx = pickerLineIndex;
    setPickerOpen(false);

    updateLine(idx, { productId: String(product.id), productName: product.name, productSku: product.sku });

    setLineLoading((prev) => ({ ...prev, [idx]: true }));
    try {
      const history = await getPriceHistory(product.id, '2022-01-01', '2025-12-31');
      if (history.items.length > 0) {
        const sorted = [...history.items].sort((a, b) =>
          b.dateTime.localeCompare(a.dateTime)
        );
        const latest = sorted[0];
        const basisQuantity = latest.quantity > 0 ? latest.quantity : 1;
        const perUnitPrice = latest.amount / basisQuantity;
        updateLine(idx, {
          unitPrice: perUnitPrice.toFixed(2),
          unitOfMeasure: latest.unitOfMeasure,
          priceEffectiveDate: latest.dateTime.slice(0, 10),
          priceBasisNote: `Latest vendor price is $${latest.amount.toFixed(2)} per ${basisQuantity} ${latest.unitOfMeasure}. This form uses per-1 ${latest.unitOfMeasure} price ($${perUnitPrice.toFixed(2)}).`,
        });
      }
    } catch {
      // Price lookup failed — user can fill in manually
      updateLine(idx, { priceBasisNote: '' });
    } finally {
      setLineLoading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const filteredProducts = (allProducts ?? []).filter((p) => {
    const q = pickerSearch.toLowerCase();
    return (
      String(p.id).includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const draftOrderTotal = lines.reduce((sum, line) => sum + getDraftLineTotal(line), 0);

  const refreshNextOrderNumber = async () => {
    try {
      const orders = await getOrders();
      const maxId = orders.reduce((max, order) => (order.id > max ? order.id : max), 0);
      setNextOrderNumber(maxId + 1);
    } catch {
      setNextOrderNumber(null);
    }
  };

  useEffect(() => {
    refreshNextOrderNumber();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createdBy.trim()) {
      setFormError('Created By is required.');
      return;
    }

    const parsedLines: CreateOrderLineRequest[] = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      const productId = Number(line.productId);
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);

      if (!Number.isFinite(productId) || productId <= 0) {
        setFormError(`Line ${i + 1}: Product ID must be a positive number.`);
        return;
      }
      if (!line.productName.trim()) {
        setFormError(`Line ${i + 1}: Product Name is required.`);
        return;
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setFormError(`Line ${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (!line.unitOfMeasure.trim()) {
        setFormError(`Line ${i + 1}: Unit of Measure is required.`);
        return;
      }
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setFormError(`Line ${i + 1}: Unit Price must be 0 or greater.`);
        return;
      }
      if (!line.priceEffectiveDate) {
        setFormError(`Line ${i + 1}: Price Effective Date is required.`);
        return;
      }

      parsedLines.push({
        productId,
        productName: line.productName.trim(),
        quantity,
        unitOfMeasure: line.unitOfMeasure.trim(),
        unitPrice,
        priceEffectiveDate: new Date(line.priceEffectiveDate).toISOString(),
      });
    }

    try {
      setSubmitting(true);
      await createOrder({
        createdBy: createdBy.trim(),
        lines: parsedLines,
      });

      setCreatedBy('');
      setLines([createEmptyLine()]);
      await refreshNextOrderNumber();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Place Order</h1>

      <section style={{ padding: '1rem', marginBottom: '1rem' }}>
        <form onSubmit={handleCreateOrder}>
          <div
            style={{
              marginBottom: '0.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Created By:</span>
              <input
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="Name"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Order Number:</span>
              <input
                value={nextOrderNumber ?? 'Loading...'}
                readOnly
                style={readOnlyInputStyle}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {lines.map((line, index) => (
              <div key={index} style={{ border: '1px solid #eee', borderRadius: '6px', padding: '0.75rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Item {index + 1}</strong>
                    {lineLoading[index] && (
                      <span style={{ fontSize: '0.85em', color: '#555' }}>Looking up price…</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                    }}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, auto) 1fr minmax(140px, 200px) minmax(160px, 220px)',
                    gap: '0.5rem',
                    alignItems: 'end',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <button type="button" onClick={() => openPicker(index)}>🔍 Select product</button>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Product Name</span>
                    <input
                      value={line.productName}
                      readOnly
                      style={readOnlyInputStyle}
                      placeholder="Product Name"
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Product ID</span>
                    <input
                      type="number"
                      min={1}
                      value={line.productId}
                      readOnly
                      style={readOnlyInputStyle}
                      placeholder="Product ID"
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>SKU</span>
                    <input
                      value={line.productSku}
                      readOnly
                      style={readOnlyInputStyle}
                      placeholder="SKU"
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Quantity</span>
                    <input
                      type="number"
                      min={0.0001}
                      step="any"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                      placeholder="Quantity"
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Unit</span>
                    <input
                      value={line.unitOfMeasure}
                      readOnly
                      style={readOnlyInputStyle}
                      placeholder="Unit (e.g. Each)"
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Unit Price</span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={line.unitPrice}
                      readOnly
                      style={readOnlyInputStyle}
                      placeholder="Unit Price "
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Price Effective Date</span>
                    <input
                      type="date"
                      value={line.priceEffectiveDate}
                      disabled
                      style={{ ...readOnlyInputStyle, opacity: 1 }}
                    />
                  </label>
                </div>

                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  {line.priceBasisNote && (
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem', flex: 1 }}>{line.priceBasisNote}</p>
                  )}
                  <p style={{ margin: 0, marginLeft: 'auto', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Item Total: ${getDraftLineTotal(line).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="button" onClick={addLine} style={{ alignSelf: 'flex-start' }}>Add line</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Order Total: ${draftOrderTotal.toFixed(2)}
              </p>
              <button
                type="submit"
                disabled={submitting}
                onMouseEnter={(e) => {
                  if (submitting) return;
                  e.currentTarget.style.background = '#15803d';
                  e.currentTarget.style.borderColor = '#166534';
                }}
                onMouseLeave={(e) => {
                  if (submitting) return;
                  e.currentTarget.style.background = '#16a34a';
                  e.currentTarget.style.borderColor = '#15803d';
                }}
                style={{
                  background: submitting ? '#94a3b8' : '#16a34a',
                  borderColor: submitting ? '#94a3b8' : '#15803d',
                  color: '#ffffff',
                }}
              >
                {submitting ? 'Saving...' : 'Place Order'}
              </button>
            </div>
          </div>

          {formError && <p style={{ color: 'red', marginTop: '0.75rem' }}>{formError}</p>}
        </form>
      </section>

      {/* ── Product Picker Modal ─────────────────────────────────────── */}
      {pickerOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPickerOpen(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '8px', padding: '1.25rem',
              width: 'min(700px, 95vw)', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Select a Product</h2>
              <button type="button" onClick={() => setPickerOpen(false)}>✕ Close</button>
            </div>

            <input
              autoFocus
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search by name, ID, SKU, or category…"
              style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
            />

            {loadingProducts && <p>Loading products…</p>}

            {!loadingProducts && (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid #ccc', textAlign: 'left',
                        position: 'sticky', top: 0, background: '#fff',
                      }}
                    >
                      <th style={{ padding: '0.4rem 0.5rem' }}>ID</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Name</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>SKU</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 100).map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td style={{ padding: '0.4rem 0.5rem' }}>{p.id}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{p.name}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{p.sku}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{p.category}</td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.75rem', color: '#888', textAlign: 'center' }}>
                          No products match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingProducts && filteredProducts.length > 100 && (
              <p style={{ margin: 0, fontSize: '0.85em', color: '#888' }}>
                Showing first 100 of {filteredProducts.length} matches — refine your search to narrow results.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
