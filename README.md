MedDistro - Pharmacy Distribution Management System
A comprehensive React-based pharmacy distribution management platform that connects distributors, pharmacies, and employees in a seamless ecosystem.
🎯 Overview
MedDistro is a full-featured web application built with React that enables:
Distributors to manage stock, process orders, track employees
Pharmacies to discover distributors and place orders
Employees to manage assigned tasks
Admins to oversee the entire system
✨ Features
For Distributors
📦 Stock Management (add, update, track inventory)
📋 Order Management (approve, reject, dispatch orders)
👥 Employee Management (assign tasks, track progress)
📄 Invoice Generation & Payment Tracking
📊 Dashboard with analytics
For Pharmacies
🔍 Find & Browse Distributors
🛒 Place Orders with Multiple Items
📋 Track Order Status
🏥 View Order History
📄 Invoice & Payment Management
For Employees
✓ Task Management
📈 Progress Tracking
🎯 Task Status Updates
For Admins
📊 System Analytics
👥 User Management
📈 Performance Metrics
🔐 System Oversight
📁 Project Structure
```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Distributor/
│   │   ├── Dashboard.jsx
│   │   ├── StockManagement.jsx
│   │   ├── OrderManagement.jsx
│   │   ├── EmployeeManagement.jsx
│   │   └── Invoices.jsx
│   ├── Pharmacy/
│   │   ├── Dashboard.jsx
│   │   ├── PlaceOrder.jsx
│   │   ├── MyOrders.jsx
│   │   ├── FindDistributors.jsx
│   │   └── Invoices.jsx
│   └── Admin/
│       └── Dashboard.jsx
├── components/
│   ├── SidebarNav.jsx
│   ├── TopBar.jsx
│   ├── Modal.jsx
│   └── Invoice.jsx
├── context/
│   └── AuthContext.jsx
├── styles/
│   ├── App.css
│   ├── Auth.css
│   ├── Dashboard.css
│   ├── SidebarNav.css
│   ├── TopBar.css
│   ├── Modal.css
│   ├── StockManagement.css
│   ├── OrderManagement.css
│   ├── EmployeeManagement.css
│   ├── PlaceOrder.css
│   └── Invoice.css
└── App.jsx
```
🚀 Installation & Setup
Prerequisites
Node.js (v14 or higher)
npm or yarn package manager
Step 1: Create React App
```bash
npx create-react-app medistro
cd medistro
```
Step 2: Install Dependencies
```bash
npm install react-router-dom
```
Step 3: File Structure Setup
Create the following folder structure in `src/`:
```
src/
├── pages/
│   ├── Distributor/
│   ├── Pharmacy/
│   └── Admin/
├── components/
├── context/
└── styles/
```
Step 4: Copy Files
Copy all the provided files to their respective locations:
Pages:
`pages/Login.jsx`, `pages/Register.jsx`
`pages/Distributor/*.jsx` files
`pages/Pharmacy/*.jsx` files
`pages/Admin/*.jsx` files
Components:
`components/SidebarNav.jsx`
`components/TopBar.jsx`
`components/Modal.jsx`
`components/Invoice.jsx`
Context:
`context/AuthContext.jsx`
Styles:
All `.css` files in `styles/` folder
Root:
`App.jsx` (replace default)
Step 5: Update App.js imports
Make sure the following imports are correct at the top of `App.jsx`:
```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
```
Step 6: Run the Application
```bash
npm start
```
The application will open at `http://localhost:3000`
🔐 Demo Credentials
Distributor Account
Email: distributor@demo.com
Password: demo123
Pharmacy Account
Email: pharmacy@demo.com
Password: demo123
Admin Account
Email: admin@demo.com
Password: demo123
Employee Account
Email: employee@demo.com
Password: demo123
🎨 Design Features
Modern UI: Clean, professional interface with gradient accents
Responsive Design: Works seamlessly on desktop, tablet, and mobile
Dark/Light Theme Ready: CSS variables for easy theme switching
Smooth Animations: Subtle transitions and hover effects
Intuitive Navigation: Clear user flow with sidebar navigation
🗂️ File Details
Core Files
App.jsx
Main application component
Routing configuration for all user roles
Protected routes based on authentication
AuthContext.jsx
Global authentication state management
Login/logout functionality
Token management
Page Components
Dashboard Pages
Role-specific dashboards
Key metrics and statistics
Quick action buttons
Recent activity feeds
Stock Management
Add/edit medicines
Track inventory levels
Low stock alerts
Stock filtering and search
Order Management
View pending/approved/dispatched orders
Change order status
Generate invoices
Order tracking
Employee Management
Add new employees
Assign tasks
Track task progress
View employee performance
Place Order (Pharmacy)
Browse distributors
Select medicines
Manage cart
Confirm order
Find Distributors
Search distributors
View distributor details
Rating and reviews
Quick order placement
Shared Components
SidebarNav.jsx
Navigation menu
Role-based menu items
Logout functionality
TopBar.jsx
User info display
Current page title
User role indicator
Modal.jsx
Reusable dialog component
Form inputs
Action buttons
Invoice.jsx
Professional invoice template
Print/download functionality
Payment tracking
Style Files
All CSS files follow a consistent design system:
CSS variables for colors and spacing
Responsive grid layouts
Mobile-first approach
Print-friendly styles
💡 Usage Examples
Adding Stock (Distributor)
Navigate to Stock Management
Click "Add New Medicine"
Fill in medicine details
Set quantity and pricing
Submit
Placing Order (Pharmacy)
Go to Place Order
Select a distributor
Add medicines from catalog
Adjust quantities
Review and confirm
Managing Employees (Distributor)
Go to Employee Management
Add new employee
Assign tasks
Track progress
Update task status
🔄 Data Flow
```
User Login
    ↓
AuthContext (Token Storage)
    ↓
Role-Based Routing
    ↓
Dashboard/Features
    ↓
Modal/Forms
    ↓
Local State Management
    ↓
Display Data
```
🛠️ API Integration (Ready for Backend)
The application is structured to easily integrate with a backend API:
Current: Mock Data
All components use dummy data for demonstration
Next: Backend Integration
Replace mock data with API calls:
```javascript
// Example - Current (Mock)
const [inventory, setInventory] = useState([...dummyData]);

// Example - Backend Ready
useEffect(() => {
  fetchInventory().then(data => setInventory(data));
}, []);
```
📱 Responsive Breakpoints
Desktop: 1024px and above
Tablet: 768px to 1023px
Mobile: Below 768px
📄 Licenses & Dependencies
React 18+
React Router v6+
CSS3 (No external CSS libraries)
JavaScript ES6+
✅ Browser Support
Chrome (latest)
Firefox (latest)
Safari (latest)
Edge (latest)
---
Version: 1.0.0  
Last Updated: March 2024  
Built with React 18 + React Router v6