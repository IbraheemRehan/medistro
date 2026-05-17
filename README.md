Medistro — Pharmacy Distribution Frontend

Professional React frontend for the Medistro pharmacy distribution platform. This app provides role-based UIs for Distributors, Pharmacies, Employees and Admins to manage inventory, orders, invoices and users.

Key features
- Role-based dashboards (Distributor, Pharmacy, Employee, Admin)
- Stock and order management, invoice generation, employee task management
- Responsive UI with reusable components and printable invoices
- Ready to integrate with the Medistro backend API

Tech stack
- React 19, react-scripts, react-router-dom
- Axios for API calls, Recharts for charts, html2canvas + jsPDF for invoice export

Prerequisites
- Node.js v14+ and npm or yarn

Quick start (development)
1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm start
```

The app runs at http://localhost:3000 by default. This project sets a proxy to `http://localhost:4000` for API requests — update `package.json` if your backend runs on a different port.

Build for production

```bash
npm run build
```

This outputs an optimized `build/` folder ready to be served by any static server or deployed behind the backend.

Environment & backend integration
- The frontend expects a REST API that follows the server routes (authentication, medicines, orders, invoices, users). Replace mock data with API calls in the `src` components (see `context/AuthContext.jsx` and `pages/*` for examples).
- If the backend is running locally on port 4000, the provided `proxy` in `package.json` will forward API requests to it.

Scripts
- `npm start` — development server
- `npm run build` — production build
- `npm test` — run tests

Useful paths
- Main app: `src/App.jsx`
- Auth state: `src/context/AuthContext.jsx`
- Pages: `src/pages/` (Distributor, Pharmacy, Admin)
- Shared components: `src/components/`

Testing credentials (demo)
- Distributor: distributor@demo.com / demo123
- Pharmacy: pharmacy@demo.com / demo123
- Admin: admin@demo.com / demo123

Notes & next steps
- To fully enable the app, run the backend and set up required environment variables (see server README). You may also seed test accounts using the server `scripts/` utilities.

License
This project is provided for educational purposes.

Version: 1.0.0
Last updated: 2026-05
 
About this document
This README expands on the frontend's purpose, architecture, how to run it locally, development tips, and a reflection on what was learned while building the project. Use this as the primary reference for contributors and evaluators.

Project summary
Medistro frontend is a role-based React application that provides interfaces for Distributors, Pharmacies, Employees and Admins to manage inventory, orders, invoices and user tasks. It prioritizes a clean UX, printable invoices, and a modular component structure so the UI can be integrated with a backend API.

Architecture & key concepts
- Single Page Application (SPA) built with React and `react-router-dom` for client-side routing.
- Global auth state managed with a React context (`src/context/AuthContext.jsx`) which stores tokens and user role information.
- API calls are made with `axios` (replace mock data with real endpoints in `src` components).
- Reusable components: `src/components/` contains shared UI like `SidebarNav`, `TopBar`, `Modal`, and `Invoice`.

Important design decisions
- Role-based navigation and protected routes to ensure only authorized users see specific pages.
- Separation of concerns: UI logic in components/pages, auth logic in context, and API layer centralized where appropriate.

Detailed run instructions
Prerequisites
- Node.js v14+ and npm (or yarn)

Local development (frontend)
1. Install dependencies

```bash
cd medistro
npm install
```

2. Start the dev server

```bash
npm start
```

3. Open the app

Visit http://localhost:3000 in your browser. The frontend is configured with a proxy to `http://localhost:4000` so API calls will be forwarded to the backend when it runs locally.

Building for production

```bash
npm run build
```

This generates an optimized `build/` directory for static hosting.

Testing

```bash
npm test
```

Environment & configuration
- The frontend does not require a `.env` by default; API base URLs can be modified in axios instances or by changing the `proxy` field in `package.json`.

Connecting to the backend
- Ensure the backend is running on the same host/port used by `proxy` (by default `http://localhost:4000`). If your backend runs at a different URL, either update the `proxy` in `package.json` or set the API base URL where `axios` is configured.

Development notes & tips
- When adding new API calls, centralize them in a `src/api/` helper so swapping base URLs or adding interceptors is easier.
- Use `AuthContext` to manage token refresh and protected-route wrappers.
- Invoice export uses `html2canvas` + `jsPDF` — test print/export flows in the browser.

Project structure (important files)
- `src/App.jsx` — main routes and app shell
- `src/context/AuthContext.jsx` — authentication provider and hooks
- `src/pages/` — top-level pages for each role
- `src/components/` — reusable UI components

What I learned (frontend)
- React fundamentals: component composition, hooks (`useState`, `useEffect`, `useContext`) and controlled forms.
- Routing and protected routes with `react-router-dom`.
- State and side-effect patterns for API-driven UIs.
- Integrating third-party libraries like `recharts` for charts and `html2canvas`/`jsPDF` for exporting UI to PDF.
- Building a role-based UI with clear separation between presentation and business logic.
- Practical debugging and developer tooling (React DevTools, browser network panel).

Common issues & troubleshooting
- Blank page on start: check console for missing imports or failing module resolutions.
- CORS / API errors: ensure backend `medistro_server` is running and proxy or base URL is correct.

Next steps / enhancements
- Add a centralized API client (`src/api/`) and environment-driven config.
- Replace any remaining mock data with real endpoints and add client-side caching.
- Add end-to-end tests to validate critical user flows (login, place order, generate invoice).

Contributing
- Fork the repo, create a feature branch, open a PR with a concise description, and include screenshots for UI changes.

Acknowledgements
- Built as part of an academic project demonstrating full-stack skills in React and Node.

Contact
- For questions about the frontend implementation, inspect `src/` or open an issue in the project tracker.