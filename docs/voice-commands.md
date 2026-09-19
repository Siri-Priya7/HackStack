# Multilingual Voice Command Guide

The voice system is designed specifically for Indian Kirana storekeepers who speak colloquial mixed language (Hinglish, Hindi, regional Indian terms, Indian English) and think in familiar packaging trade units.

---

## 1. Supported Spoken Intents & Trigger Keywords

| Intent | Action | Hinglish Keywords | Hindi (Devanagari) | English Keywords |
|---|---|---|---|---|
| `ADD_STOCK` | Stock Inward / Restock | *aaya, aayi, aaye, add karo, daalo, jodo, stock aaya, kharida, plus* | *आया, आई, जोड़ो, डालो, स्टॉक आया, खरीदा* | *add, received, bought, restock, plus* |
| `REMOVE_STOCK` | Sales / Deduct | *becha, bika, de diya, nikalo, kam karo, minus, bik gaya, out* | *बेचा, बिका, दे दिया, कम करो, निकाला* | *sell, sold, deduct, remove, minus* |
| `QUERY_STOCK` | Balance Inquiry | *kitna hai, kitna bacha, check karo, status, dikhao, kya hai* | *कितना है, कितना बचा, चेक करो, बताओ* | *how much, how many, check stock, status* |
| `GET_ALERTS` | Low Stock Warning | *kya khatam ho raha, kya kam hai, alert, reorder* | *क्या खत्म हो रहा है, क्या कम है, अलर्ट* | *what is running low, alerts, reorders* |
| `GET_SUMMARY` | Daily Report | *aaj ka hisab, summary batao, dukaan ka haal, report* | *आज का हिसाब, समरी बताओ, दुकान का हाल* | *today's summary, business report, overview* |

---

## 2. Recognized Indian Trade Units

| Spoken Unit | Canonical | Standard Base Unit | Default Conversion Multiplier | Typical Usage |
|---|---|---|---|---|
| **bori, bora, katta, bag, moottai** | `bori` | `kg` | 25 kg or 50 kg (configurable per item) | Rice, Atta, Sugar, Dal |
| **peti, carton, box, crate** | `peti` | `litre` or `pcs` | 12 or 24 units | Mustard Oil, Soap, Biscuits |
| **packet, pkt, pouch** | `packet` | `litre` or `kg` | 0.5 L or 250 g | Milk, Chai Patti, Masala |
| **dozen, darjan** | `dozen` | `pcs` | 12 pieces | Eggs, Bananas |
| **quintal, palla, kattal** | `quintal` | `kg` | 100 kg | Bulk Potatoes, Onions |
| **kilo, kg, kilogram** | `kg` | `kg` | 1 kg | Direct loose retail |
| **gram, gm, g** | `g` | `kg` | 0.001 kg | Spices, dry fruits |
| **litre, liter, l** | `litre` | `litre` | 1 litre | Edible oils, milk |

---

## 3. Spoken Number Recognition (Digits & Vernacular)

The entity extractor recognizes both numeric digits and spoken numbers in Romanized Hinglish and Devanagari Hindi:

- **Fractions**: `aadha / आधा` (0.5), `dedh / डेढ़` (1.5), `dhai / ढाई` (2.5), `sawa` (1.25)
- **1 to 10**: `ek / एक` (1), `do / दो` (2), `teen / तीन` (3), `chaar / चार` (4), `paanch / पाँच` (5), `chhah / che / छह` (6), `saat / सात` (7), `aath / आठ` (8), `nau / नौ` (9), `das / dus / दस` (10)
- **11 to 20**: `gyarah` (11), `baarah` (12), `terah` (13), `chaudah` (14), `pandrah` (15), `solah` (16), `satrah` (17), `atharah` (18), `unnees` (19), `bees` (20)
- **Bulk**: `pachees` (25), `tees` (30), `chalis` (40), `pachaas` (50), `sau` (100)

---

## 4. Real-World Sample Utterances & Parsed Deltas

### Example 1: Restocking Rice Bags
- **Shopkeeper says**: *"5 bori basmati chawal aaya"*
- **Language**: Hinglish
- **Intent**: `ADD_STOCK`
- **Product**: Basmati Rice
- **Trade Delta**: `+5 bori`
- **Base Delta**: `+125 kg`
- **Spoken Audio Feedback**: *"5 bori Basmati Rice stock mein add ho gaya. Ab kul 10 Bori (250 kg) hai."*

### Example 2: Selling Milk Packets
- **Shopkeeper says**: *"10 packet doodh becha"*
- **Language**: Hinglish
- **Intent**: `REMOVE_STOCK`
- **Product**: Fresh Milk Packets
- **Trade Delta**: `-10 packet`
- **Base Delta**: `-5 litre`
- **Spoken Audio Feedback**: *"10 packet Fresh Milk Packets sell ho gaya. Ab bacha hai 2 Packets (1 Litre)."*

### Example 3: Loose Sugar Sale
- **Shopkeeper says**: *"5 kilo chini customer ko diya"*
- **Language**: Hinglish
- **Intent**: `REMOVE_STOCK`
- **Product**: Sugar (Chini)
- **Trade Delta**: `-5 kg`
- **Base Delta**: `-5 kg`
- **Spoken Audio Feedback**: *"5 kg Sugar (Chini) sell ho gaya. Ab bacha hai 3 kg."*

### Example 4: Stock Inquiry
- **Shopkeeper says**: *"Cheeni kitni bachi hai?"*
- **Intent**: `QUERY_STOCK`
- **Product**: Sugar (Chini)
- **Spoken Audio Feedback**: *"Sugar (Chini) ka current stock 3 kg hai."*

### Example 5: Alert Check
- **Shopkeeper says**: *"Kya khatam ho raha hai?"*
- **Intent**: `GET_ALERTS`
- **Spoken Audio Feedback**: *"Sugar (Chini) aur Mustard Oil ka stock kam hai."*

### Example 6: Daily Summary
- **Shopkeeper says**: *"Aaj ka hisab batao"*
- **Intent**: `GET_SUMMARY`
- **Spoken Audio Feedback**: *"Dukaan mein kul 10 items hain. Aaj kul ₹1444 ki bikri hui hai."*
