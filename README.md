# 🎙️ Voice-Based Inventory Management for Small Businesses (Apna Kirana AI)

> **A simple, voice-first inventory management solution allowing Indian Kirana and small retail store owners to add, remove, track, and understand their stock by speaking naturally in regional or mixed languages with familiar trade units.**

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![UI: React + Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue.svg)](https://vitejs.dev/)
[![Backend: Express + SQLite](https://img.shields.io/badge/Backend-Express%20%2B%20SQLite-orange.svg)](https://expressjs.com/)
[![Deploy to Render](https://img.shields.io/badge/Deploy%20to-Render-46E3B7?logo=render&logoColor=white)](https://render.com)

---

## 🚩 The Problem
Many small businesses across India still manage inventory mentally, in notebooks, or on WhatsApp. Existing inventory software creates severe friction:
- **Requires tedious typing** on small screens.
- **English-only or technical ERP jargon** alienates shopkeepers with low digital literacy.
- **Forces rigid standard units** (kg/g/litres) instead of the **customary trade packaging** shopkeepers actually use (*bori*, *peti*, *dozen*, *quintal*, *palla*, *packet*)

## 💡 The Solution
A voice-first inventory solution where shopkeepers can speak naturally:
> **"5 bori chawal aaya"** $\rightarrow$ Automatically adds 125 kg Basmati Rice and reports *"5 bori Basmati Rice stock mein add ho gaya. Ab kul 10 Bori (250 kg) hai."* via spoken audio response!

---

## 👥 4-Role Architecture & Directory Structure

```
voice-inventory-management/
│
├── frontend/                         👤 Person 1
│   ├── public/
│   ├── src/
│   │   ├── components/ (Navbar, VoiceButton, ProductCard, StockCard, AlertCard, TransactionCard)
│   │   ├── pages/ (Login, Register, Dashboard, Inventory, VoiceCommand, Transactions, Alerts)
│   │   ├── services/ (api.js)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── App.jsx, main.jsx, index.css
│   └── package.json
│
├── backend/                          👤 Person 2
│   ├── src/
│   │   ├── config/ (db.js - automated schema & seeding)
│   │   ├── controllers/ (authController, productController, inventoryController, transactionController)
│   │   ├── routes/ (authRoutes, productRoutes, inventoryRoutes, transactionRoutes)
│   │   ├── middleware/ (authMiddleware.js)
│   │   ├── models/ (User.js, Product.js, Inventory.js, Transaction.js)
│   │   ├── services/ (inventoryService.js)
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── voice-ai/                         👤 Person 3
│   ├── src/
│   │   ├── speech/ (speechToText.js - Web Speech & Audio configuration)
│   │   ├── nlp/ (intentParser.js, entityExtractor.js, languageDetector.js)
│   │   ├── prompts/ (inventoryPrompt.js)
│   │   ├── services/ (voiceService.js - hybrid rule + LLM fallback)
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── inventory-engine/                 👤 Person 4
│   ├── src/
│   │   ├── units/ (unitDefinitions.js, unitConverter.js)
│   │   ├── validation/ (commandValidator.js)
│   │   ├── stock/ (stockCalculator.js, stockManager.js)
│   │   ├── alerts/ (lowStock.js, reorderSuggestion.js)
│   │   ├── reports/ (inventorySummary.js)
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── database/                         🗄️ Shared
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── docs/                             📚 Shared
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── voice-commands.md
│   └── setup.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## ✨ Key Features

1. **🎙️ Native Voice Input & Spoken TTS Feedback**
   - Live Web Speech API integration in Hindi (`hi-IN`), Indian English / Hinglish (`en-IN`), Tamil (`ta-IN`), and Telugu (`te-IN`).
   - Natural spoken text-to-speech audio feedback confirming updates in real time.

2. **📦 Customary Indian Trade Units**
   - Understood natively: *Bori / Bag* (sacks), *Peti / Carton* (cases), *Dozen / Darjan*, *Quintal / Palla*, *Packet / Pouch*, *Kilo*, *Gram*, *Litre*.
   - Automatically maintains dual representation: exact scientific base units (`kg`, `pcs`, `L`) for accounting, and practical trade strings (*"5 Bori 10 kg"*) for the shopkeeper.

3. **🧠 Multilingual NLP & Indian Phonetic Matching**
   - Normalizes phonetic variations (*cheeni* $\leftrightarrow$ *chini*, *doodh* $\leftrightarrow$ *dudh*, *aashirvaad* $\leftrightarrow$ *ashirvad*).
   - Accurately parses vernacular number words (*aadha, dedh, dhai, paanch, das, bees, pachaas*).

4. **⚠️ Real-time Stock Alerts & Wholesale Reorder Sheets**
   - Automatically flags items falling below shop safety thresholds.
   - Computes smart replenishment orders in whole bags/cartons with wholesale cost estimates.

5. **⏪ Frictionless Audit Log & 1-Click Rollback**
   - Every transaction logs the exact spoken voice sentence.
   - Accidental entries can be reversed with a single click on "Undo".

---

## 🚀 Quick Start (1 Command)

```bash
# Install root orchestrator
npm install

# Start Backend (Port 5000) & Frontend (Port 5173) together
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.
Click **"Login as Demo Store"** for immediate access!

---

## 🌐 Deploy to Render (render.com)

You can deploy Apna Kirana AI with **1 click** as a unified full-stack service on Render:

1. Push your changes to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** $\rightarrow$ **Blueprint**.
3. Select your repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Click **Apply** to deploy!

For a full step-by-step walkthrough, environment variable details, and manual setup instructions, see the [Render Deployment Guide](docs/render-deployment.md).

---

## 🧪 Running Unit Tests

```bash
npm test
```
- Tests Trade Unit conversions (Bori, Peti, Dozen $\leftrightarrow$ Base units).
- Tests Voice AI NLP parsing across Hindi, Hinglish, and English.
