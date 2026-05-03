# Phase 11 - Dynamic Public Website + Website Management

Added a dynamic public website inside the same Laravel + React/Inertia project.

## Public website URLs
- `/home`
- `/about`
- `/services`
- `/collections`
- `/gallery`
- `/contact`

## Admin website management URLs
- `/website-admin`
- `/website-admin/settings`
- `/website-admin/hero-slides`
- `/website-admin/services`
- `/website-admin/gallery`
- `/website-admin/testimonials`
- `/website-admin/messages`
- `/website-admin/appointments`

## Added database tables
- `website_settings`
- `hero_slides`
- `website_services`
- `website_gallery_items`
- `website_testimonials`
- `contact_messages`
- `appointment_requests`

## Product website fields
- `show_on_website`
- `is_featured`
- `website_short_description`
- `website_short_description_bn`

## Notes
- Website supports Bangla/English switching using the existing locale system.
- Website content can be managed from the admin panel.
- Products appear on the public website only when `Show on website` is enabled.
- Featured products appear on the home page when both `Show on website` and `Featured on website` are enabled.
