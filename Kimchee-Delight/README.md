# Kimchee Delight Ops (school prototype)

## Run with XAMPP
1. Install XAMPP, open the Control Panel, start **Apache** and **MySQL**.
2. Copy this project folder into `C:\xampp\htdocs\Kimchee-Delight\`.
3. Go to http://localhost/phpmyadmin → **Import** tab → choose `database/samgyutrack.sql` → **Import**.
   (It creates the `samgyutrack` database, the `daily_consumption` table and 7 sample rows.)
4. Import `database/inventory_orders.sql` into phpMyAdmin too. It adds shared order/inventory tables and
   sample inventory rows. For an existing installation, import this additional file only; do not re-import
   `samgyutrack.sql` over existing daily records.
5. If your MySQL has a password, edit `config/database.php`.
6. Open http://localhost/Kimchee-Delight/ . The interface icons are inline SVGs and do not require a CDN.

## What really works (PHP + MySQL)
Dashboard cards and the 7-recorded-day consumption trend; Consumption records can be added, edited, deleted
(with confirmation), and filtered by date, with historical averages. Orders are shared through MySQL.
Inventory items, current balances, and stock movements are shared through MySQL. The stock list summarizes
inventory and highlights out-of-stock and low-stock items; quantities, received/used-today totals, and
per-item count/unit settings are available there. Served orders save their status only—they do not deduct
inventory. Inventory sample balances and daily-consumption sample rows are marked as samples; daily
summaries prefer recorded rows.

## Simulated (browser localStorage, no database)
Queue. It includes a live table-availability board, party seating, estimated wait times, and a two-hour
seating timer. The selected light/dark theme and collapsed/expanded navigation preferences are also saved
in browser storage.

The sample inventory import includes 27 item names and balances from the KD Tanay spreadsheet. Their units
are initially "unit" and each balance is marked Sample. Verify physical quantities and use **Set count** to
record actual stock before relying on inventory alerts. Existing orders and inventory movements previously
saved in browser storage are not automatically copied into MySQL; retain them separately before switching if
they contain data you need. Daily Consumption records and Inventory movements remain separate; do not record
the same usage in both.

The interface supports dark and light themes. Use the sun/moon button in the top bar to switch; the choice is
remembered in browser storage. There is no staff login yet. Restrict access to a trusted local network and do
not expose this prototype to the public internet.

## Formulas (includes/calc.php)
- Total meat = pork + beef + chicken + other
- Avg meat / customer = total meat ÷ customers (shown as "—" if customers = 0)
- Avg meat cost / customer = meat cost ÷ customers
- Avg revenue / customer = revenue ÷ customers
- Net profit = revenue − meat cost − other expenses
- Margin % = net profit ÷ revenue × 100 (shown as "—" if revenue = 0)
- Dashboard "last 7 days" = last 7 recorded days. Filtered/historical average = total meat ÷ total customers over the range (not an average of daily averages).
