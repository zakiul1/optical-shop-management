# Phase 5 Complete - Reports & PDF/Print

## Added

- Reports dashboard at `/reports`
- Report print/PDF page at `/reports/print`
- Daily, monthly, yearly and custom date-range filters
- Sales summary cards
- Paid, due, discount, tax and estimated profit summary
- Sales trend by period
- Payment method breakdown
- Top selling products report
- Invoice list report
- Low stock report
- Medicine expiry report, including expired and expiring within 1 month
- Stock movement report
- Print-friendly report page that can be saved as PDF from the browser print dialog
- Reports menu item in the admin sidebar

## How to use

1. Run the app.
2. Open `/reports`.
3. Select Daily, Monthly, Yearly or Custom Range.
4. Click **Print / Save PDF**.
5. In the browser print dialog, choose **Save as PDF**.

## Check commands used

```bash
php -l app/Http/Controllers/Admin/ReportController.php
npm install
npm run build
```

`npm run build` passed successfully in this package.

## Next Phase

Phase 6 should add purchase/stock-in management, suppliers, stock adjustment, stronger notifications/modals, authentication polish and final UI refinements.
