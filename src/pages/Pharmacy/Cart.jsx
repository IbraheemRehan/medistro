import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import API from '../../config/api.config';
import { PharmacyNavItems } from '../../config/navItems';
import { FiShoppingCart, FiShoppingBag, FiBox, FiFileText, FiUser, FiTrash2, FiAlertCircle, FiCheckCircle, FiX, FiBarChart2 } from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdLocalShipping } from 'react-icons/md';

export default function Cart() {
  const { user } = useContext(AuthContext);
  const [cart, setCart]       = useState({ items: [] });
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/api/v1/cart');
      setCart(data.cart || { items: [] });
      setTotal(data.totalAmount || 0);
    } catch { setError('Failed to load cart.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (item, qty) => {
    if (qty < 1) return;
    try {
      await API.post('/api/v1/cart/add', {
        medicineId:   item.medicineId?._id || item.medicineId,
        batchId:      item.batchId,
        medicineName: item.medicineName,
        quantity:     qty,
        unitPrice:    item.unitPrice,
        distributorId: item.distributorId?._id || item.distributorId,
      });
      fetchCart();
    } catch { setError('Failed to update quantity.'); }
  };

  const removeItem = async (medicineId) => {
    try {
      await API.delete(`/api/v1/cart/item/${medicineId}`);
      fetchCart();
    } catch { setError('Failed to remove item.'); }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try { await API.delete('/api/v1/cart/clear'); fetchCart(); }
    catch { setError('Failed to clear cart.'); }
  };

  const placeOrder = async () => {
    if (!cart.items?.length) return;
    const firstItem = cart.items[0];
    const distributorId = firstItem.distributorId?._id || firstItem.distributorId;
    setPlacing(true); setError(''); setSuccess('');
    try {
      const items = cart.items.map(i => ({
        medicineId: i.medicineId?._id || i.medicineId,
        batchId: i.batchId,
        quantity: i.quantity,
      }));
      await API.post('/api/v1/orders', { distributorId, items });
      await API.delete('/api/v1/cart/clear');
      setSuccess('Order placed successfully! Confirmation email sent.');
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    }
    setPlacing(false);
  };

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />
      <div className="main-content">
        <TopBar title="My Cart" />
        <div className="page-content animate-fade">
          <div className="page-header page-header-row">
            <div>
              <h1><FiShoppingBag style={{marginRight:12}}/> Shopping Cart</h1>
              <p>{cart.items?.length || 0} item(s) in your cart</p>
            </div>
            {cart.items?.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={clearCart} style={{display:'flex', alignItems:'center', gap:8}}><FiTrash2 /> Clear Cart</button>
            )}
          </div>

          {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}><FiCheckCircle style={{marginRight:8}}/> {success}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
              <div className="spinner spinner-blue" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
              <p>Loading cart…</p>
            </div>
          ) : cart.items?.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ marginBottom: 16 }}><FiShoppingCart size={56} color="#9CA3AF" /></div>
              <h3 style={{ color: '#374151', marginBottom: 8 }}>Your cart is empty</h3>
              <p style={{ color: '#6B7280', fontSize: 14 }}>Browse medicines and add them to your cart.</p>
              <a href="/pharmacy/place-order" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
                Browse Medicines
              </a>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Cart Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cart.items.map((item, idx) => (
                  <div key={idx} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1565C0' }}>
                      <MdOutlineLocalPharmacy size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{item.medicineName}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                        {item.distributorId?.companyName || 'Distributor'} · PKR {item.unitPrice?.toLocaleString()} / unit
                      </div>
                    </div>
                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ width: 32, padding: '6px 0' }}
                        onClick={() => updateQty(item, item.quantity - 1)}>−</button>
                      <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{item.quantity}</span>
                      <button className="btn btn-secondary btn-sm" style={{ width: 32, padding: '6px 0' }}
                        onClick={() => updateQty(item, item.quantity + 1)}>+</button>
                    </div>
                    <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 700, color: '#1565C0' }}>
                      PKR {(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ padding: '6px 10px', display:'flex', alignItems:'center', justifyContent:'center' }}
                      onClick={() => removeItem(item.medicineId?._id || item.medicineId)}><FiX /></button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="card" style={{ padding: 24, position: 'sticky', top: 84 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {cart.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280' }}>
                      <span>{item.medicineName} × {item.quantity}</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>PKR {(item.unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#1565C0', fontSize: 18 }}>PKR {total.toLocaleString()}</span>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={placeOrder} disabled={placing}>
                  {placing ? <><span className="spinner" /> Placing…</> : <><FiCheckCircle style={{marginRight:8}}/> Place Order</>}
                </button>
                <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>
                  A confirmation email will be sent after placing your order.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
