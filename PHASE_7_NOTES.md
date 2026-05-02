# Phase 7 Notes - Authentication, Access Control & Audit Logs

## Added

- Login and logout flow with Inertia + React.
- Authenticated route protection for all admin/shop pages.
- Active-user middleware: inactive users are logged out and blocked.
- Admin-only middleware for security pages.
- User management page for admins:
  - Create admin, manager, staff users.
  - Edit name, email, phone, role, password and active status.
  - Prevent deleting yourself.
  - Prevent removing the final admin user.
- Activity log viewer:
  - Filter by action, user, date range and search.
  - Shows who performed create/update/delete/login/logout actions.
  - Shows changed fields when old/new values are available.
- Admin layout updates:
  - Logged-in user menu.
  - Logout button.
  - Security menu section for admin users.
- Seeder updates:
  - Default admin user: admin@optical.test / password
  - Default staff user: staff@optical.test / password

## Important routes

- `/login`
- `/dashboard`
- `/users` admin only
- `/activity-logs` admin only

## Run after replacing files

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
