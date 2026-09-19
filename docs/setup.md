# Setup & Quick Start Guide

This project is organized as a monorepo containing:
- `frontend/` (React 18 + Vite UI)
- `backend/` (Node.js Express REST API)
- `voice-ai/` (Multilingual Speech & NLP Parser)
- `inventory-engine/` (Trade Unit & Stock Engine)
- `database/` (SQLite Schema & Seed Data)

---

## 1. Prerequisites
- **Node.js**: v18.0 or higher (v20+ recommended)
- **npm**: v9.0 or higher
- Modern Web Browser (Chrome, Edge, or Brave recommended for Web Speech API)

---

## 2. Fast 1-Command Startup

From the project root directory (`d:/GigHackathon`):

```bash
# 1. Install root dependencies
npm install

# 2. Start both Backend & Frontend concurrently
npm run dev
```

The services will start automatically:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

*(Note: The database at `database/inventory.db` is initialized and seeded automatically on first run).*

---

## 3. Individual Component Startup

If you prefer to run services in separate terminals:

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Running Unit Tests

### Test Inventory Engine:
```bash
node inventory-engine/test/unitTest.js
```
*Validates trade unit normalization, packaging conversions (bori, dozen, quintal), and stock math.*

### Test Voice AI Service:
```bash
node voice-ai/test/voiceTest.js
```
*Validates multilingual language detection, intent parsing, entity extraction, and phonetic alias matching.*

---

## 5. Testing with the Demo Kirana Account

On the frontend login screen:
- Click **"Login as Demo Store (Ramesh Sharma)"**
- Or use:
  - **Phone**: `9876543210`
  - **Password**: `kirana123`

You can test voice commands immediately either by:
1. Clicking the large **"बोलकर स्टॉक बदलें"** microphone button and speaking.
2. Navigating to the **"Voice Assistant"** tab and clicking any of the ready-made test chips (e.g., *"5 bori chawal add karo"*).
