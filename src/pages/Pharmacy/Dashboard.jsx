import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios, { getApiErrorMessage } from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import RatingsDashboardCard from '../../components/RatingsDashboardCard';
import CartSummaryCard from '../../components/CartSummaryCard';
import RatingReminderBanner from '../../components/RatingReminderBanner';
import PostOrderRatingModal from '../../components/PostOrderRatingModal';
import { useSocket } from '../../context/SocketContext';
import { PharmacyNavItems } from '../../config/navItems';
import { FiBox, FiClock, FiDollarSign } from 'react-icons/fi';
import { MdLocalShipping, MdOutlineShoppingCart } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { findUnratedOrderForReminder } from '../../utils/ratingReminder';
import { normalizeWorkflowStatus } from '../../utils/orderStatus';
import '../../styles/cartSummary.css';

const PharmacyDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    activeDistributors: 0,
    recentOrders: [],
  });

  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [reminderOrder, setReminderOrder] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [syncTick, setSyncTick] = useState(0);
  const { socket } = useSocket();

  const filteredCartItems = useMemo(() => {
    if (!selectedDistributor) return cartItems;
    const id = selectedDistributor._id;
    return cartItems.filter((i) => (i.distributorId?._id || i.distributorId) === id);
  }, [cartItems, selectedDistributor]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, distRes, cartRes, ratingsRes] = await Promise.all([
          axios.get('/api/v1/orders?page=1&limit=100').catch(() => ({ data: { orders: [] } })),
          axios.get('/api/v1/distributors?page=1&limit=1000').catch(() => ({ data: [] })),
          axios.get('/api/v1/cart').catch(() => ({ data: { cart: { items: [] } } })),
          axios.get('/api/v1/orders/ratings/summary').catch(() => ({ data: null })),
        ]);
        setRatingsSummary(ratingsRes.data || null);

        const orders = ordersRes.data?.orders || [];
        const distributorsData = Array.isArray(distRes.data) ? distRes.data : (distRes.data?.distributors || []);
        const cartItemsData = cartRes.data?.cart?.items || [];

        const completedStatuses = ['completed', 'delivered', 'received'];
        const totalSpent = orders
          .filter((o) => completedStatuses.includes(normalizeWorkflowStatus(o.status)))
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pending = orders.filter((o) => normalizeWorkflowStatus(o.status) === 'pending').length;

        const mappedOrders = orders.map((o) => ({
          id: o._id,
          displayId: `ORD-${o._id.substring(0, 8).toUpperCase()}`,
          distributorName: o.distributorId?.companyName || 'Distributor',
          status: normalizeWorkflowStatus(o.status),
          distributorRating: o.distributorRating,
          distributorId: o.distributorId,
        }));
        setReminderOrder(findUnratedOrderForReminder(mappedOrders, 'pharmacy'));

        setDashboardData({
          totalOrders: orders.length,
          pendingOrders: pending,
          totalSpent,
          activeDistributors: distributorsData.length,
          recentOrders: orders.slice().reverse().slice(0, 5).map((o) => ({
            id: o._id.substring(0, 8),
            distributor: o.distributorId?.companyName || '—',
            amount: o.totalAmount,
            status: normalizeWorkflowStatus(o.status),
            date: new Date(o.createdAt).toLocaleDateString(),
          })),
        });

        setCartItems(
          cartItemsData.map((item) => ({
            medicineId: item.medicineId?._id || item.medicineId,
            medicineName: item.medicineName || item.medicineId?.name || 'Medicine',
            unitPrice: item.unitPrice,
            originalUnitPrice: item.originalUnitPrice || item.unitPrice,
            discountPercent: item.discountPercent || 0,
            quantity: item.quantity,
            subtotal: item.unitPrice * item.quantity,
            maxStock: item.availableStock || 999,
            distributorId: item.distributorId?._id || item.distributorId,
            distributorName: item.distributorId?.companyName,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchData();
  }, [syncTick]);

  // Keep dashboard in sync when distributor updates inventory/pricing.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'inventoryUpdated' || e.key === 'paymentUpdated') {
        setSyncTick(Date.now());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onSync = () => setSyncTick(Date.now());
    socket.on("order:updated", onSync);
    socket.on("payment:updated", onSync);
    return () => {
      socket.off("order:updated", onSync);
      socket.off("payment:updated", onSync);
    };
  }, [socket]);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await axios.get('/api/v1/distributors');
        const uniqueDists = [];
        const seen = new Set();
        (res.data || []).forEach((d) => {
          const key = (d.companyName || '').trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueDists.push(d);
          }
        });
        setDistributors(uniqueDists);
      } catch (err) {
        console.error('Failed to fetch distributors', err);
      }
    };
    fetchDistributors();
  }, []);

  const handleSelectDistributor = (dist) => {
    setSelectedDistributor(dist);
  };

  const handleRemoveCartItem = async (medicineId) => {
    try {
      await axios.delete(`/api/v1/cart/item/${medicineId}`);
      setCartItems(cartItems.filter((i) => i.medicineId !== medicineId));
      toast.success('Item removed');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove item from cart'));
    }
  };

  const openRateFromReminder = (order) => {
    setRatingModal({
      orderId: order.id,
      counterpartName: order.distributorName,
      reportedUserId: order.distributorId?.userId?._id || order.distributorId?.userId,
    });
    setReminderOrder(null);
  };

  const statCards = [
    { title: 'Total Orders', value: dashboardData.totalOrders, icon: <FiBox />, color: 'blue', link: '/pharmacy/my-orders' },
    { title: 'Pending Orders', value: dashboardData.pendingOrders, icon: <FiClock />, color: 'amber', link: '/pharmacy/my-orders' },
    { title: 'Total Spent', value: `Rs. ${dashboardData.totalSpent.toLocaleString()}`, icon: <FiDollarSign />, color: 'green', link: '/pharmacy/invoices' },
    { title: 'Active Distributors', value: dashboardData.activeDistributors, icon: <MdLocalShipping />, color: 'info', link: '/pharmacy/distributors' },
    { title: 'Cart Items', value: filteredCartItems.length || cartItems.length, icon: <MdOutlineShoppingCart />, color: 'purple', link: '/pharmacy/cart' },
  ];

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="Pharmacy Dashboard" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header">
            <h1>Welcome back, {user?.username || 'Pharmacy'}!</h1>
            <p style={{ color: 'var(--gray-500)' }}>Here&apos;s an overview of your pharmacy&apos;s activities.</p>
          </div>

          {reminderOrder && (
            <RatingReminderBanner
              order={reminderOrder}
              role="pharmacy"
              onRate={openRateFromReminder}
              onDismiss={() => setReminderOrder(null)}
            />
          )}

          <div className="grid-4" style={{ marginBottom: 32 }}>
            {statCards.map((card, idx) => (
              <div key={idx} className="stat-card" onClick={() => navigate(card.link)} style={{ cursor: 'pointer' }}>
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-split">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Distributors</span>
              </div>
              <div className="card-body" style={{ maxHeight: 480, overflowY: 'auto' }}>
                {distributors.length === 0 ? (
                  <p style={{ color: 'var(--gray-500)' }}>No distributors found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {distributors.map((dist) => (
                      <button
                        key={dist._id}
                        type="button"
                        className={`distributor-card${selectedDistributor?._id === dist._id ? ' dist-card--active' : ''}`}
                        onClick={() => handleSelectDistributor(dist)}
                        style={{
                          cursor: 'pointer',
                          padding: 14,
                          border: selectedDistributor?._id === dist._id ? '2px solid var(--brand)' : '1px solid var(--gray-200)',
                          borderRadius: 10,
                          background: selectedDistributor?._id === dist._id ? '#eff6ff' : '#fff',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{dist.companyName}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>{dist.address || '—'}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--gray-500)' }}>{dist.contactNumber || '—'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <CartSummaryCard
              items={filteredCartItems}
              selectedDistributor={selectedDistributor}
              onRemoveItem={handleRemoveCartItem}
            />
          </div>

          <RatingsDashboardCard summary={ratingsSummary} loading={ratingsLoading} receivedLabel="Distributor" />
        </div>
      </div>

      {ratingModal?.orderId && (
        <PostOrderRatingModal
          orderId={ratingModal.orderId}
          counterpartName={ratingModal.counterpartName}
          reportedUserId={ratingModal.reportedUserId}
          raterRole="pharmacy"
          onClose={() => {
            setRatingModal(null);
            setReminderOrder(null);
          }}
          onSkip={() => setRatingModal(null)}
        />
      )}
    </div>
  );
};

export default PharmacyDashboard;
