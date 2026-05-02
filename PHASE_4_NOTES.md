# Phase 4 - Sales, Invoice and Stock Out

Added modules:

- Sales list with search, date filter and payment status filter.
- New sale form with customer details.
- Optional eye prescription fields in sale form.
- Medicine/glass product selection with live cart totals.
- Automatic invoice number generation.
- Automatic stock out when sale is completed.
- Stock movement entry for every sold product.
- Sale details page.
- Print-ready invoice page. Use the browser Print dialog and choose "Save as PDF" to generate a PDF invoice.
- Sale delete/reverse flow that returns stock and logs the action.
- Dashboard sales stats and recent sales table.

Run after replacing files:

```powershell
composer install
npm install
php artisan config:clear
php artisan cache:clear
php artisan migrate:fresh --seed
npm run dev
```

In another terminal:

```powershell
php artisan serve
```

Open:

```text
http://localhost:8000/sales
```
