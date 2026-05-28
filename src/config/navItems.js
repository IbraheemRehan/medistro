import React from 'react';
import { 
  FiBarChart2, FiUsers, FiUser, FiShoppingCart, 
  FiShoppingBag, FiBox, FiFileText, FiClock, FiShield
} from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdLocalShipping, MdOutlineInventory } from 'react-icons/md';

export const AdminNavItems = [
  { label: 'Dashboard',  path: '/admin/dashboard', icon: <FiBarChart2 /> },
  { label: 'Moderation', path: '/admin/moderation', icon: <FiShield /> },
  { label: 'Profile',    path: '/profile',           icon: <FiUser /> },
];

export const PharmacyNavItems = [
  { label: 'Dashboard',    path: '/pharmacy/dashboard',    icon: <FiBarChart2 /> },
  { label: 'Place Order',  path: '/pharmacy/place-order',  icon: <FiShoppingCart /> },
  { label: 'My Cart',      path: '/pharmacy/cart',         icon: <FiShoppingBag /> },
  { label: 'My Orders',    path: '/pharmacy/my-orders',    icon: <FiBox /> },
  { label: 'Invoices',     path: '/pharmacy/invoices',     icon: <FiFileText /> },
  { label: 'Distributors', path: '/pharmacy/distributors', icon: <MdLocalShipping /> },
  { label: 'Profile',      path: '/profile',               icon: <FiUser /> },
];

export const DistributorNavItems = [
  { label: 'Dashboard',    path: '/distributor/dashboard', icon: <FiBarChart2 /> },
  { label: 'Stock',        path: '/distributor/stock',     icon: <MdOutlineInventory /> },
  { label: 'Orders',       path: '/distributor/orders',    icon: <FiShoppingCart /> },
  { label: 'Employees',    path: '/distributor/employees', icon: <FiUsers /> },
  { label: 'Invoices',     path: '/distributor/invoices',  icon: <FiFileText /> },
  { label: 'Profile',      path: '/profile',               icon: <FiUser /> },
];

export const EmployeeNavItems = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: <FiBarChart2 /> },
  { label: 'Profile',    path: '/profile',               icon: <FiUser /> },
];
