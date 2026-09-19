# Inventory Engine (Person 4)

Core inventory calculation, trade unit conversion, and alert logic for Indian small business inventory management.

## Capabilities

1. **Trade Unit Conversion (`src/units/`)**:
   - Converts regional units (`bori`, `peti`, `carton`, `dozen`, `quintal`, `packet`) into standard base units (`kg`, `pcs`, `litre`) using custom product multipliers.
   - Formats base quantities back into intuitive trade descriptions (e.g. `125 kg` $\rightarrow$ `"5 Bori (125 kg)"`).

2. **Validation (`src/validation/`)**:
   - Checks intent, product, quantity sanity, and checks stock availability before allowing deductions.

3. **Stock Management (`src/stock/`)**:
   - Calculates updated balances, status (`in_stock`, `low_stock`, `out_of_stock`), and auto-generates localized audio confirmations in Hinglish, Hindi, and English.

4. **Alerts & Reorders (`src/alerts/`)**:
   - Real-time low-stock detection based on customizable per-product thresholds.
   - Smart reorder suggestions framed in practical trade units (e.g., "Order 2 Bori of Sugar").

5. **Summaries (`src/reports/`)**:
   - Compiles store metrics and plain-language spoken audio scripts for morning/evening store summaries.
