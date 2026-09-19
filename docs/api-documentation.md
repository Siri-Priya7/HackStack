# REST API Documentation

The backend service runs on port `5000` (or `PORT` environment variable) and serves all endpoints under `/api`.

All requests accept and return `application/json`.
For authenticated routes, include `Authorization: Bearer <token>`.
*(Note: If the header is omitted during testing, the API automatically defaults to the Demo Storekeeper for frictionless evaluation).*

---

## 1. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/login`
Authenticates a storekeeper using their phone number and password.
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "password": "kirana123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Ramesh Sharma",
      "store_name": "Sharma Kirana & General Store",
      "phone": "9876543210",
      "preferred_language": "hi-IN",
      "role": "owner"
    }
  }
  ```

### POST `/api/auth/register`
Registers a new storekeeper and initializes their store.
- **Request Body**:
  ```json
  {
    "name": "Suresh Patel",
    "store_name": "Patel Provision Store",
    "phone": "9123456789",
    "password": "securepassword",
    "preferred_language": "hi-IN"
  }
  ```

### POST `/api/auth/language`
Updates the preferred voice language for the current storekeeper.
- **Request Body**:
  ```json
  {
    "language": "hi-IN"
  }
  ```

---

## 2. Voice & Inventory Endpoints (`/api/inventory`)

### POST `/api/inventory/voice`
**The primary voice execution endpoint.** Analyzes natural language utterances, extracts entities, and executes inventory modifications.
- **Request Body**:
  ```json
  {
    "transcript": "5 bori chawal add karo",
    "dryRun": false
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "action": "ADD_STOCK",
    "product": {
      "id": 1,
      "name": "Basmati Rice",
      "base_unit": "kg",
      "default_unit": "bori"
    },
    "operation": {
      "productId": 1,
      "previousStockBase": 125,
      "newStockBase": 250,
      "deltaBase": 125,
      "displayString": "10 Bori (250 kg)",
      "status": "in_stock",
      "tradeQuantity": 5,
      "tradeUnit": "bori",
      "totalAmount": 9375
    },
    "spokenFeedback": "5 bori Basmati Rice stock mein add ho gaya. Ab kul 10 Bori (250 kg) hai."
  }
  ```

### GET `/api/inventory`
Retrieves all inventory items joined with catalog metadata.
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "product_id": 1,
        "product_name": "Basmati Rice",
        "category": "Grains",
        "regional_names": ["chawal", "basmati", "rice"],
        "current_stock_base": 125,
        "current_stock_display": "5 Bori (125 kg)",
        "status": "in_stock",
        "selling_price": 95,
        "min_stock_threshold": 50
      }
    ]
  }
  ```

### GET `/api/inventory/summary`
Returns store KPIs and plain-language voice audio scripts.
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalProducts": 10,
        "totalStockValue": 68450,
        "outOfStockCount": 0,
        "lowStockCount": 5,
        "todaySalesAmount": 1444
      },
      "voiceSummary": {
        "hinglish": "Dukaan mein kul 10 items hain. 5 items ka stock kam hai, jaise Sugar (Chini), Mustard Oil. Aaj kul ₹1444 ki bikri hui hai.",
        "hindi": "दुकान में कुल 10 सामान हैं। 5 सामान कम हैं। आज कुल ₹1444 की बिक्री हुई।",
        "english": "Store has 10 products with ₹68450 total value..."
      }
    }
  }
  ```

### GET `/api/inventory/alerts`
Returns active low-stock items and smart trade-unit reorder suggestions.
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "alerts": [...],
      "suggestions": [
        {
          "productId": 3,
          "productName": "Sugar (Chini)",
          "currentStockDisplay": "8 kg (0 Bori)",
          "suggestedQty": 2,
          "suggestedUnit": "bori",
          "suggestionText": "2 Bori (100 kg)",
          "estimatedCost": 3800
        }
      ]
    }
  }
  ```

### POST `/api/inventory/quick-adjust`
Enables manual 1-click +/- adjustments.
- **Request Body**:
  ```json
  {
    "productId": 1,
    "type": "IN",
    "quantity": 1,
    "unit": "bori"
  }
  ```

---

## 3. Transactions & Audit Trail (`/api/transactions`)

### GET `/api/transactions?limit=50`
Retrieves past transactions including spoken transcripts and language tags.

### POST `/api/transactions/:id/undo`
Rolls back a transaction and restores stock to prior state.
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Transaction #5 undone. Sugar (Chini) stock restored to 13 kg."
  }
  ```

---

## 4. Product Catalog (`/api/products`)

### GET `/api/products`
Lists all products.

### POST `/api/products`
Adds a new product to the catalog.
- **Request Body**:
  ```json
  {
    "name": "Chana Dal",
    "category": "Pulses",
    "regional_names": ["chana dal", "chana", "kadala paruppu"],
    "base_unit": "kg",
    "default_unit": "bori",
    "unit_size": 30.0,
    "purchase_price": 80,
    "selling_price": 105,
    "min_stock_threshold": 30,
    "reorder_quantity": 60
  }
  ```
