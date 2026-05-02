# Phase 10 Notes

## Completed

- Rebuilt dashboard with a premium responsive layout so stat cards no longer squeeze icons/text.
- Added PDF download/print actions for report print page, sales invoice, and purchase receipt.
- Fixed report print page back navigation by replacing the non-working close action with a real link back to the filtered report page.
- Added optional multiple image upload for medicine and glass products.
- Added image previews before upload and existing image remove/undo support.
- Added product image database table and ProductImage model.
- Added admin/user profile photo upload with preview and remove support.
- Added global language switch beside dark mode.
- Added English/Bangla language infrastructure, translated admin navigation, dashboard, notifications, main PDF/print pages and shared labels.
- Added locale-aware invoice/report/purchase PDF text so generated PDF follows the selected language where translation keys are used.

## Important command

Run this once after deployment/local setup so uploaded images are publicly available:

```bash
php artisan storage:link
```

## Notes

- PDF download uses the browser print dialog so users can choose "Save as PDF". This keeps it lightweight and avoids server font issues for Bangla.
- More Bangla labels can be added from `resources/js/i18n.js` as new modules/pages are polished.
