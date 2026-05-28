import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/cart.css';
import { Toaster, toast } from 'react-hot-toast';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import API from '../../config/api.config';
import { PharmacyNavItems } from '../../config/navItems';
import {
  FiShoppingBag, FiTrash2, FiX, FiCheckCircle,
  FiAlertCircle, FiPackage, FiShield, FiMail,
  FiChevronRight, FiMinus, FiPlus,
} from 'react-icons/fi';

/* ─── helpers ─────────────────────────────────────────── */
const medicineKey = item =>
  `${item.medicineId?._id || item.medicineId}_${item.batchId}`;

/* ─── CartItem ────────────────────────────────────────── */
function CartItem({ item, onIncrease, onDecrease, onRemove, isUpdating }) {
  const subtotal = (item.unitPrice * item.quantity).toLocaleString();
  const company  = item.distributorId?.companyName || 'Distributor';
  const originalUnitPrice = item.originalUnitPrice ?? item.unitPrice ?? 0;
  const discountPercent = item.discountPercent ?? 0;
  const hasDiscount = discountPercent > 0 && Number(originalUnitPrice) > Number(item.unitPrice);

  return (
    <div className={`ci-card${isUpdating ? ' ci-card--updating' : ''}`}>
      {/* left – medicine icon */}
      <div className="ci-icon">
        <FiPackage size={20} />
      </div>

      {/* centre – info */}
      <div className="ci-info">
        <p className="ci-name">{item.medicineName}</p>
        <div className="ci-meta">
          <span className="ci-badge">{company}</span>
          <span className="ci-unit">PKR {item.unitPrice?.toLocaleString()} / unit</span>
          {hasDiscount && (
            <>
              <span className="ci-original">PKR {Number(originalUnitPrice).toLocaleString()}</span>
              <span className="ci-discount">Save {discountPercent}%</span>
            </>
          )}
        </div>
      </div>

      {/* qty stepper */}
      <div className="ci-stepper">
        <button
          className="step-btn"
          onClick={() => onDecrease(item)}
          disabled={item.quantity <= 1 || isUpdating}
          aria-label="Decrease quantity"
        >
          <FiMinus size={14} />
        </button>
        <span className="step-val">{item.quantity}</span>
        <button
          className="step-btn"
          onClick={() => onIncrease(item)}
          disabled={isUpdating}
          aria-label="Increase quantity"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* subtotal */}
      <div className="ci-subtotal">PKR {subtotal}</div>

      {/* remove */}
      <button
        className="ci-remove"
        onClick={() => onRemove(item)}
        disabled={isUpdating}
        aria-label="Remove item"
      >
        <FiX size={15} />
      </button>
    </div>
  );
}

/* ─── DistributorTabs ─────────────────────────────────── */
function DistributorTabs({ items, active, onChange }) {
  const ids = [...new Set(items.map(i => i.distributorId?._id || i.distributorId))];
  if (ids.length <= 1) return null;

  return (
    <div className="dist-tabs">
      {ids.map(id => {
        const name = items.find(
          i => (i.distributorId?._id || i.distributorId) === id
        )?.distributorId?.companyName || 'Distributor';
        return (
          <button
            key={id}
            className={`dist-tab${active === id ? ' dist-tab--active' : ''}`}
            onClick={() => onChange(id)}
          >
            {name}
            <span className="dist-tab-count">
              {items.filter(i => (i.distributorId?._id || i.distributorId) === id).length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── OrderSummary ────────────────────────────────────── */
function OrderSummary({ filteredItems, total, onPlace, placing }) {
  const finalTotal = filteredItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
  const originalTotal = filteredItems.reduce((s, i) => {
    const originalUnit = i.originalUnitPrice ?? i.unitPrice;
    return s + Number(originalUnit) * i.quantity;
  }, 0);
  const discountTotal = Math.max(0, originalTotal - finalTotal);

  return (
    <div className="os-card">
      <div className="os-head">
        <span className="os-head-icon"><FiShoppingBag size={16} /></span>
        <h3>Order Summary</h3>
      </div>

      <div className="os-body">
        {/* line items */}
        <ul className="os-lines">
          {filteredItems.map((item, i) => (
            <li key={i} className="os-line">
              <span className="os-line-name">
                {item.medicineName}
                <span className="os-line-qty">×{item.quantity}</span>
              </span>
              <span className="os-line-price">
                PKR {(item.unitPrice * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>

        <div className="os-sep" />

        {/* totals */}
        <div className="os-totals">
          <div className="os-row">
            <span className="os-row-label">Original Price</span>
            <span className="os-row-val">PKR {originalTotal.toLocaleString()}</span>
          </div>
          <div className="os-row">
            <span className="os-row-label">Discount</span>
            <span className="os-row-val" style={{ color: 'var(--success, #059669)' }}>
              − PKR {discountTotal.toLocaleString()}
            </span>
          </div>
          <div className="os-sep" />
          <div className="os-row os-grand">
            <span className="os-row-label">Final Price</span>
            <span className="os-row-val os-grand-val">PKR {finalTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className="os-cta"
          onClick={onPlace}
          disabled={placing || filteredItems.length === 0}
        >
          {placing ? (
            <>
              <span className="os-spinner" />
              Placing Order…
            </>
          ) : (
            <>
              <FiCheckCircle size={17} />
              Place Order
              <FiChevronRight size={15} style={{ marginLeft: 'auto' }} />
            </>
          )}
        </button>

        {/* trust badges */}
        <div className="os-trust">
          <span><FiShield size={13} /> Secure checkout</span>
          <span><FiMail size={13} /> Email confirmation</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart (main) ─────────────────────────────────────── */
export default function Cart() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [placing, setPlacing]               = useState(false);
  const [filterDistributorId, setFilterDistributorId] = useState('');
  // tracks which medicine keys are mid-request
  const [updating, setUpdating]             = useState(new Set());

  /* ── fetch ── */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/api/v1/cart');
      const fetched = data.cart?.items || [];
      setItems(fetched);
      const ids = [...new Set(fetched.map(i => i.distributorId?._id || i.distributorId))];
      if (ids.length) setFilterDistributorId(prev => (ids.includes(prev) ? prev : ids[0]));
    } catch {
      setError('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const onStorage = e => {
      if (e.key === 'placeOrderCart' || e.key === 'inventoryUpdated') fetchCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchCart]);

  /* ── derived ── */
  const filteredItems = items.filter(
    i => !filterDistributorId || (i.distributorId?._id || i.distributorId) === filterDistributorId
  );
  const total = filteredItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  // total breakdown is recomputed inside OrderSummary, but we keep `total` for existing API calls.

  /* ── optimistic quantity update ── */
  const changeQty = async (item, newQty) => {
    if (newQty < 1) return;
    const key = medicineKey(item);

    // 1. Optimistic – update local state immediately (no re-fetch)
    setItems(prev =>
      prev.map(i => medicineKey(i) === key ? { ...i, quantity: newQty } : i)
    );
    setUpdating(prev => new Set(prev).add(key));

    try {
      await API.post('/api/v1/cart/add', {
        medicineId:    item.medicineId?._id || item.medicineId,
        batchId:       item.batchId,
        medicineName:  item.medicineName,
        quantity:      newQty,
        unitPrice:     item.unitPrice,
        originalUnitPrice: item.originalUnitPrice,
        discountPercent: item.discountPercent,
        distributorId: item.distributorId?._id || item.distributorId,
      });
    } catch {
      // 2. Revert on failure
      setItems(prev =>
        prev.map(i => medicineKey(i) === key ? { ...i, quantity: item.quantity } : i)
      );
      toast.error('Failed to update quantity.');
    } finally {
      setUpdating(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  /* ── remove ── */
  const removeItem = async item => {
    const key = medicineKey(item);
    const medicineId = item.medicineId?._id || item.medicineId;

    // Optimistic remove
    setItems(prev => prev.filter(i => medicineKey(i) !== key));
    setUpdating(prev => new Set(prev).add(key));

    try {
      await API.delete(`/api/v1/cart/item/${medicineId}`);
      toast.success('Item removed');
    } catch {
      // Revert
      setItems(prev => [...prev, item]);
      toast.error('Failed to remove item.');
    } finally {
      setUpdating(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  /* ── clear ── */
  const clearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    const snapshot = [...items];
    setItems([]);
    try {
      await API.delete('/api/v1/cart/clear');
      toast.success('Cart cleared');
    } catch {
      setItems(snapshot);
      toast.error('Failed to clear cart.');
    }
  };

  /* ── place order ── */
  const placeOrder = async () => {
    if (!items.length) { toast.error('Your cart is empty.'); return; }
    if (!filterDistributorId) { toast.error('Please select a distributor.'); return; }
    const distIds = [...new Set(items.map(i => i.distributorId?._id || i.distributorId))];
    if (distIds.length > 1) {
      toast.error('Cart has items from multiple distributors. Use the tabs to place per distributor.');
      return;
    }
    const itemsToOrder = filteredItems
      .filter(i => i.batchId)
      .map(i => ({
        medicineId: i.medicineId?._id || i.medicineId,
        batchId:    i.batchId,
        quantity:   i.quantity,
      }));
    setPlacing(true);
    try {
      await API.post('/api/v1/orders', { distributorId: filterDistributorId, items: itemsToOrder, note: '' });
      await API.delete('/api/v1/cart/clear');
      toast.success('Order placed! Confirmation email sent.');
      localStorage.removeItem('placeOrderCart');
      navigate('/pharmacy/my-orders');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  /* ── render ── */
  return (
    <div className="app-layout fade-in">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'inherit', fontSize: 14 } }} />
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="My Cart" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>

          {/* ── Page header ── */}
          <div className="cart-header">
            <div className="cart-header-left">
              <h1><FiShoppingBag /> Shopping Cart</h1>
              <p>
                <strong>{items.length}</strong> item{items.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            {items.length > 0 && (
              <button className="cart-clear-btn" onClick={clearCart}>
                <FiTrash2 size={14} /> Clear Cart
              </button>
            )}
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="cart-alert cart-alert--error">
              <FiAlertCircle size={16} /> {error}
            </div>
          )}

          {/* ── Loading ── */}
          {loading ? (
            <div className="cart-loading-state">
              <div className="cart-loading-spinner" />
              <p>Loading your cart…</p>
            </div>

          /* ── Empty ── */
          ) : items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <FiShoppingBag size={40} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Browse medicines and add them to your cart.</p>
              <a href="/pharmacy/place-order" className="cart-browse-btn">
                Browse Medicines <FiChevronRight size={15} />
              </a>
            </div>

          /* ── Items ── */
          ) : (
            <>
              <DistributorTabs
                items={items}
                active={filterDistributorId}
                onChange={setFilterDistributorId}
              />

              <div className="cart-body">
                {/* items column */}
                <div className="cart-items-col">
                  <p className="col-label">
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                    {[...new Set(items.map(i => i.distributorId?._id || i.distributorId))].length > 1
                      ? ' from selected distributor'
                      : ''}
                  </p>

                  {filteredItems.map(item => (
                    <CartItem
                      key={medicineKey(item)}
                      item={item}
                      onIncrease={i => changeQty(i, i.quantity + 1)}
                      onDecrease={i => changeQty(i, i.quantity - 1)}
                      onRemove={removeItem}
                      isUpdating={updating.has(medicineKey(item))}
                    />
                  ))}
                </div>

                {/* summary column */}
                <OrderSummary
                  filteredItems={filteredItems}
                  total={total}
                  onPlace={placeOrder}
                  placing={placing}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}