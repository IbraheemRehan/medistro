import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import API from '../../config/api.config';
import { AdminNavItems } from '../../config/navItems';
import { FiBarChart2, FiUsers, FiUser, FiDollarSign, FiBox, FiAlertCircle, FiTrendingUp, FiPieChart, FiClock } from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdLocalShipping } from 'react-icons/md';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS  = ['#1565C0','#00897B','#F59E0B','#DC2626','#0288D1','#7C3AED'];
const STATUS_COLORS = { pending:'#F59E0B', approved:'#0288D1', delivered:'#00897B', rejected:'#DC2626', dispatched:'#7C3AED' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'white', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(21,101,192,.15)', fontSize:13, border:'1px solid #DBEAFE' }}>
      <p style={{ fontWeight:700, color:'#1565C0', marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? `PKR ${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null);
  const [topMeds, setTopMeds]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, medsRes] = await Promise.all([
          API.get('/api/v1/analytics/stats'),
          API.get('/api/v1/analytics/top-medicines'),
        ]);
        setStats(statsRes.data);
        setTopMeds(medsRes.data.topMedicines || []);
      } catch { setError('Failed to load analytics. Make sure you are logged in as Admin.'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const monthlyData = (stats?.monthlyOrders || []).map(m => ({
    name: `${MONTH_NAMES[(m._id.month || 1) - 1]} ${m._id.year}`,
    Orders: m.count,
    Revenue: m.revenue || 0,
  }));

  const statusData = (stats?.ordersByStatus || []).map(s => ({
    name: s._id ? s._id.charAt(0).toUpperCase() + s._id.slice(1) : 'Unknown',
    value: s.count,
  }));

  const userRoleData = (stats?.usersByRole || []).map(u => ({
    name: u._id ? u._id.charAt(0).toUpperCase() + u._id.slice(1) : 'Unknown',
    value: u.count,
  }));

  const topMedsData = topMeds.slice(0, 8).map(m => ({
    name: m.medicineName || 'Unknown',
    Ordered: m.totalOrdered,
  }));

  const kpis = stats ? [
    { label: 'Total Revenue',   value: `PKR ${(stats.stats.totalRevenue||0).toLocaleString()}`, icon: <FiDollarSign />, color: 'green' },
    { label: 'Total Orders',    value: stats.stats.totalOrders,   icon: <FiBox />, color: 'blue'  },
    { label: 'Pharmacies',      value: stats.stats.totalPharmacies, icon: <MdOutlineLocalPharmacy />, color: 'info' },
    { label: 'Distributors',    value: stats.stats.totalDistributors, icon: <MdLocalShipping />, color: 'amber' },
    { label: 'Medicines',       value: stats.stats.totalMedicines, icon: <MdOutlineLocalPharmacy />, color: 'blue' },
    { label: 'Total Users',     value: stats.stats.totalUsers,    icon: <FiUsers />, color: 'green' },
  ] : [];

  if (loading) return (
    <div className="app-layout">
      <SidebarNav role="admin" navItems={AdminNavItems} />
      <div className="main-content">
        <TopBar title="Dashboard" />
        <div className="page-content" style={{ textAlign:'center', paddingTop:80 }}>
          <div className="spinner" style={{ width:40,height:40,margin:'0 auto 16px', border:'4px solid #f3f3f3', borderTop:'4px solid #3498db', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
          <p style={{ color:'#6B7280' }}>Loading analytics…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <SidebarNav role="admin" navItems={AdminNavItems} />
      <div className="main-content">
        <TopBar title="Admin Dashboard" />
        <div className="page-content animate-fade">

          <div className="page-header">
            <h1><FiBarChart2 style={{marginRight:12}}/> Analytics Overview</h1>
            <p>System-wide statistics and insights</p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom:20 }}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}

          {/* KPI Cards */}
          <div className="grid-3" style={{ marginBottom:28 }}>
            {kpis.map((kpi, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-icon ${kpi.color}`}>{kpi.icon}</div>
                <div>
                  <div className="stat-value">{kpi.value}</div>
                  <div className="stat-label">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue & Orders Area Chart */}
          <div className="grid-2" style={{ marginBottom:24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FiTrendingUp /> Monthly Orders & Revenue</span>
              </div>
              <div className="card-body">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.18}/>
                          <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#00897B" stopOpacity={0.18}/>
                          <stop offset="95%" stopColor="#00897B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF"/>
                      <XAxis dataKey="name" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:12 }}/>
                      <Area type="monotone" dataKey="Orders"  stroke="#1565C0" strokeWidth={2.5} fill="url(#gradBlue)"  name="Orders"/>
                      <Area type="monotone" dataKey="Revenue" stroke="#00897B" strokeWidth={2.5} fill="url(#gradGreen)" name="Revenue"/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF', fontSize:14 }}>No order history yet</div>
                )}
              </div>
            </div>

            {/* Order Status Pie */}
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FiPieChart /> Orders by Status</span>
              </div>
              <div className="card-body">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name?.toLowerCase()] || PIE_COLORS[i % PIE_COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]}/>
                      <Legend wrapperStyle={{ fontSize:12 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF', fontSize:14 }}>No orders yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Medicines + User Roles */}
          <div className="grid-2" style={{ marginBottom:24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><MdOutlineLocalPharmacy /> Top Medicines by Orders</span>
              </div>
              <div className="card-body">
                {topMedsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topMedsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FF" horizontal={false}/>
                      <XAxis type="number" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
                      <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:'#6B7280' }} axisLine={false} tickLine={false} width={110}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="Ordered" fill="#1565C0" radius={[0,6,6,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF', fontSize:14 }}>No data yet</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FiUsers /> Users by Role</span>
              </div>
              <div className="card-body">
                {userRoleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {userRoleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#9CA3AF', fontSize:14 }}>No users yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FiClock /> Recent Orders</span>
              <span className="badge badge-blue">{stats?.recentOrders?.length || 0} shown</span>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Order ID</th><th>Pharmacy</th><th>Distributor</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {(stats?.recentOrders || []).length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'#9CA3AF', padding:32 }}>No orders yet</td></tr>
                  ) : (stats?.recentOrders || []).map(o => (
                    <tr key={o._id}>
                      <td style={{ fontWeight:700, color:'#1565C0', fontFamily:'monospace', fontSize:13 }}>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.pharmacyId?.pharmacyName || '—'}</td>
                      <td>{o.distributorId?.companyName || '—'}</td>
                      <td style={{ fontWeight:600 }}>PKR {(o.totalAmount||0).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${o.status==='delivered'?'green':o.status==='pending'?'amber':o.status==='rejected'?'red':'blue'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color:'#6B7280', fontSize:13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}