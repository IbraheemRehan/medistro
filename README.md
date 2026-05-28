# Medistro Frontend

## Overview

This repository contains the React frontend for the Medistro pharmacy distribution platform.

The frontend offers role-specific user interfaces for:
- **Distributors** — manage stock, orders, invoices, and employees
- **Pharmacies** — browse distributors, place orders, and view invoices
- **Employees** — monitor assigned tasks
- **Admins** — access management and moderation tools

The React app is configured to communicate with the backend API in `../medistro_server`.

---

## Technology Stack

- React 19
- react-router-dom v7 for routing
- Axios for HTTP requests
- Recharts for charts and dashboard metrics
- html2canvas + jsPDF for invoice export
- react-hot-toast for notifications
- socket.io-client for realtime updates

---

## Installation

```bash
cd medistro
npm install
```

### Run in development

```bash
npm start
```

The app runs at `http://localhost:3000` by default.

### Build for production

```bash
npm run build
```

This produces an optimized `build/` folder ready for deployment.

### Run tests

```bash
npm test
```

---

## API Integration

The frontend is configured to use `http://localhost:4000` as the backend API host via the `proxy` field in `package.json`.

A few pages use `REACT_APP_API_URL` if defined, otherwise they fall back to `http://localhost:4000`.

### Most common API endpoints

- `POST /api/v1/users/login`
- `POST /api/v1/users/register`
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/change-password`
- `GET /api/v1/medicines`
- `POST /api/v1/medicines`
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/invoices`
- `POST /api/v1/cart/add`
- `DELETE /api/v1/cart/clear`

---

## Project Structure

```
medistro/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ config/
│  ├─ context/
│  ├─ pages/
│  ├─ styles/
│  └─ App.js
├─ package.json
└─ README.md
```

### Important files

- `src/App.js` — route definitions and role-based rendering
- `src/context/AuthContext.jsx` — auth state, login/logout, JWT handling
- `src/context/SocketContext.jsx` — realtime socket provider
- `src/config/api.config.js` — Axios instance with base URL and interceptors
- `src/pages/` — screens for each user role and shared pages
- `src/components/` — reusable UI components

---

## Routing and Roles

The app supports the following route groups:

### Public routes
- `/login`
- `/register`
- `/about`
- `/verify-email`
- `/forgot-password`
- `/admin-login`
- `/auth/google/callback`

### Distributor routes
- `/distributor/dashboard`
- `/distributor/stock`
- `/distributor/orders`
- `/distributor/employees`
- `/distributor/invoices`

### Pharmacy routes
- `/pharmacy/dashboard`
- `/pharmacy/place-order`
- `/pharmacy/cart`
- `/pharmacy/my-orders`
- `/pharmacy/invoices`
- `/pharmacy/distributors`

### Employee routes
- `/employee/dashboard`

### Admin routes
- `/admin/dashboard`
- `/admin/moderation`
- `/admin/users`

---

## Key Functionality

### Authentication
- Login and registration flows
- Password recovery and email verification
- Google OAuth callback support
- Role-based protected routing

### Distributor features
- Stock and medicine management
- Order review and fulfillment
- Invoice generation and status tracking
- Employee assignment and task tracking

### Pharmacy features
- Browse distributors and inventory
- Build cart and place orders
- Track orders and invoices
- Rate order service after receipt

### Employee features
- Review assigned tasks
- Update task statuses
- View employee dashboard analytics

---

## Configuration

The frontend uses a proxy in `package.json`:

```json
"proxy": "http://localhost:4000"
```

To use a different backend URL, either update the proxy or set `REACT_APP_API_URL` in your environment.

---

## Development Notes

- Centralize additional API calls in a shared API helper to keep requests consistent.
- Keep authentication logic in `AuthContext.jsx`.
- Use reusable components from `src/components/` for layout, cards, tables, and modals.
- Validate backend responses and show errors via toast notifications.

---

## Troubleshooting

- Blank page after startup: check the browser console for runtime errors.
- CORS or network errors: verify the backend is running and proxy / base URL is correct.
- Login failures: ensure the correct backend environment variables and JWT secret are configured.

---

## Future improvements

- Add centralized API error handling and retry logic
- Add Cypress or Playwright end-to-end tests
- Add environment-specific build config for staging and production
- Add a dedicated design system folder for shared component styles

---

## License

This README is for educational and demonstration purposes.


Contact
- For questions about the frontend implementation, inspect `src/` or open an issue in the project tracker.