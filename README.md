# 🧠 Digital Twin for Student: Telemetry & AI Diagnostic Core

A premium, full-stack MERN platform designed to track, model, and project cognitive focus cycles, burnout indices, streaks, and stress-recovery curves for students. Built with fluid glassmorphic UI aesthetics, responsive Recharts telemetry grids, and a secure Google OAuth + email OTP authentication core.

---

## 🚀 Dynamic Architecture & Spacing Grid

The project features a decoupled full-stack architecture separated into a secure **Express API Backend** and a fast **Vite React SPA Frontend**.

```
d:/Digital Twin/
├── backend/
│   ├── config/db.js            # MongoDB Atlas connectivity
│   ├── config/memoryDb.js      # Resilient offline local DB fallback
│   ├── controllers/
│   │   ├── authController.js   # OAuth, JWT, and Email OTP handlers
│   │   ├── goalController.js   # Gamified objective CRUD engines
│   │   ├── logController.js    # Multi-variable telemetry journal
│   │   └── twinController.js   # Rolling statistics compiler & streak solver
│   ├── models/                 # Mongoose schemas (User, DailyLog, Goal)
│   ├── utils/aiEngine.js       # Core linear regression growth solvers
│   ├── server.js               # Node server listener
│   └── package.json            # Backend Node packages
└── frontend/
    ├── src/
    │   ├── components/Layout/
    │   │   ├── Sidebar.jsx    # SaaS vertical Collapsible Sidebar Navigation
    │   │   └── GlowBackground.jsx # Drifting radial-blur mesh background
    │   ├── context/AuthContext.jsx # Global security state machine
    │   ├── pages/              # Auth, Dashboard, Tracker, Analytics, Goals, Insights
    │   ├── App.jsx             # Shared state compiler and dynamic margins
    │   └── main.jsx            # Google OAuth wrapper and DOM anchor
    ├── tailwind.config.js      # Glassmorphic dark theme tokens
    └── package.json            # React 19 SPA bundles
```

---

## ⚡ Main Features

1. **Collapsible SaaS Sidebar**: Smooth liquid-width transitions (`w-64` to `w-20`) with absolute glassmorphic hover tooltips, a circular floating border toggle, and centered status avatar orb.
2. **AI Twin Telemetry Dashboard**: Animated cognitive state indicators reflecting rolling fatigue index limits.
3. **Journal Logger**: Dynamic range sliders for tracking sleep recovery ratios, stress variables, and focus points.
4. **Interactive Analytics Hub**: Recharts line, area, and bar diagrams showing correlation indices over 7-day, 30-day, and historic timeframes.
5. **Kanban Objectives**: Sub-metric progress bars with automated milestone achievements.
6. **AI Deep-Dive Predictor**: Extrapolates growth curves over 30 days utilizing linear regression fits on rolling historical telemetry.
7. **Production Security Core**: Custom email verification with 6-segment OTP cells, spam-blocking countdown timers, and official Google OAuth 2.0 logins.

---

## 💻 Quickstart Local Guide

Navigate to the project directory:

### 1. Backend API Server Setup
1. Enter the directory: `cd backend`
2. Install packages: `npm.cmd install`
3. Configure environment variables in a local `.env` (refer to `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_signing_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   SMTP_USER=sumitksingh2466@gmail.com
   SMTP_PASS=mcup qrms yibu xvtn
   SMTP_SENDER="Digital Twin" <sumitksingh2466@gmail.com>
   ```
4. Boot server in hot-reload mode: `npm.cmd run dev`

### 2. Frontend SPA Client Setup
1. Enter the directory: `cd ../frontend`
2. Install packages: `npm.cmd install`
3. Add Google OAuth variables in `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```
4. Start developer server: `npm.cmd run dev`
5. Open browser at: `http://localhost:5173`

---

## 🌐 Production Hosting Guide

Follow these instructions to host the entire full-stack MERN application on the cloud:

### 1. Database (MongoDB Atlas)
* Your remote cluster is **already hosted** on MongoDB Atlas! No extra server hosting is required. Just ensure your Production IP whitelist allows incoming requests (set to `0.0.0.0/0` in Atlas Network Security to permit requests from server instances like Render).

### 2. Backend Hosting (Render - Recommended)
Render is a completely free, fast cloud host for Node.js backend services:
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`SumitKSinghDev/DigitalTwin`).
4. Set the following parameters:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Click **Advanced** and add your `.env` keys under **Environment Variables** (DO NOT commit these keys to GitHub! Render injects them securely):
   * `PORT`: `5000`
   * `MONGO_URI`: `your_atlas_connection_string`
   * `JWT_SECRET`: `secure_jwt_key_phrase`
   * `SMTP_USER`, `SMTP_PASS`, `SMTP_SENDER`, `GOOGLE_CLIENT_ID`
6. Click **Create Web Service**. Render will yield a live service URL (e.g. `https://digital-twin-backend.onrender.com`).

### 3. Frontend Hosting (Vercel - Recommended)
Vercel is the premier free hosting platform for React and Vite SPAs:
1. Log in to [Vercel](https://vercel.com/) (connect your GitHub account).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`SumitKSinghDev/DigitalTwin`).
4. In the configuration dashboard:
   * **Framework Preset**: Select **Vite**.
   * **Root Directory**: Select `frontend`.
5. Under **Environment Variables**, add:
   * `VITE_GOOGLE_CLIENT_ID` = `your_google_client_id`
6. Click **Deploy**. Vercel will build and host your frontend, yielding a secure URL (e.g. `https://digital-twin-student.vercel.app`).

### 🔗 Connecting Frontend & Backend
Once hosted, you will need to update the API gateway URLs so that the frontend knows where to request database operations:
* In [frontend/src/utils/api.js](file:///d:/Digital%20Twin/frontend/src/utils/api.js), the axios instance is configured to use:
  ```javascript
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  });
  ```
* Just add a new environment variable `VITE_API_URL` to Vercel pointing to your hosted Render backend (e.g. `https://digital-twin-backend.onrender.com/api`) and redeploy! Both modules will connect seamlessly in production.
