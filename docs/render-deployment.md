# 🚀 Deploying Apna Kirana AI on Render (render.com)

This guide walks you through deploying the **Voice-Based Inventory Management System (Apna Kirana AI)** onto [Render](https://render.com).

The project is structured as a **Unified Full-Stack Web Service**:
- Express backend hosts all REST API routes (`/api/*`) and handles SQLite database operations.
- Built React + Vite static assets (`frontend/dist`) are served directly by Express with client-side SPA routing fallback.
- Operates within Render's **Free Tier** (750 free instance hours/month) with zero cross-origin CORS overhead!

---

## 📋 Prerequisites

1. A [Render Account](https://render.com) (free signup via GitHub/GitLab/email).
2. Your repository pushed to GitHub (e.g., `Siri-Priya7/HackStack`).
3. *(Optional)* Google Gemini API Key if you want to use the Vision AI / LLM fallback features.

---

## ⚡ Method 1: Automatic 1-Click Blueprint Deploy (Recommended)

This repository includes a pre-configured [`render.yaml`](../render.yaml) file that defines all build steps, start commands, health check paths, and environment variables.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button at the top right and select **Blueprint**.
3. Connect your GitHub repository (`HackStack`).
4. Render will detect the `render.yaml` file automatically:
   - **Service Name**: `apna-kirana-ai`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. If prompted for `GEMINI_API_KEY`, enter your Gemini API key (or leave blank if testing without Vision AI).
6. Click **Apply**.
7. Render will build both backend and frontend dependencies, compile the React assets, and deploy the service.

---

## 🛠️ Method 2: Manual Web Service Setup via Dashboard

If you prefer to configure the service manually through the Render dashboard:

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** and select **Web Service**.
2. Connect your GitHub repository (`HackStack`).
3. Fill in the service details:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `apna-kirana-ai` (or any custom name) |
   | **Language / Runtime** | `Node` |
   | **Branch** | `main` |
   | **Region** | Select closest (e.g., `Oregon (US West)` or `Singapore`) |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

4. Scroll down to **Advanced** and expand it:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`

5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `20.18.0` | Ensures compatible Node runtime |
   | `JWT_SECRET` | `your-secure-random-secret-key` | Used to sign auth tokens |
   | `GEMINI_API_KEY` | *(optional)* `AIzaSy...` | For AI image detection & voice fallback |

6. Click **Create Web Service**.

---

## 🔍 Verification & Health Check

Once the deployment shows **Live**:

1. **Verify Health Endpoint**:
   ```
   https://<your-service-name>.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "voice-inventory-backend",
     "multiTenancy": true,
     "roles": ["platform_admin", "shop_owner", "staff"],
     "timestamp": "..."
   }
   ```

2. **Access the Web App**:
   - Open `https://<your-service-name>.onrender.com` in your browser.
   - Click **"Login as Demo Store"** for immediate pre-seeded access.
   - Click the microphone button and grant browser microphone permissions to speak inventory commands in Hindi or English (e.g., *"5 bori chawal add karo"*).

---

## 💡 Important Notes for Render Free Tier

1. **Cold Starts**:
   - On the Free plan, Render spins down web services after 15 minutes of inactivity.
   - When a new request arrives, Render takes 30–50 seconds to spin the container back up.
   - Subsequent requests will be fast and responsive.

2. **Database Persistence & Automatic Seeding**:
   - The application uses SQLite (`database/inventory.db`). On the free tier, the container disk is ephemeral (resets on container restart or redeployment).
   - To make this hassle-free, `backend/src/config/db.js` automatically re-seeds standard Kirana products and demo store accounts whenever a fresh database starts.
   - If persistent storage across redeployments is desired, upgrade the service to Render's *Starter* plan and attach a [Render Persistent Disk](https://render.com/docs/disks) mounted to `/data` with environment variable `DATABASE_PATH=/data/inventory.db`.

3. **Microphone Permissions (HTTPS)**:
   - Modern browsers require HTTPS to allow Web Speech API microphone access.
   - Render automatically provides a free, valid SSL/TLS certificate (`https://`) on your `*.onrender.com` domain.
