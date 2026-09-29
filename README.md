# Cheptulel Boys Senior School Website — Version 3

A responsive school website prototype with a browser-based local CMS.

## What's new in V3
- Navy blue, pale blue and maroon visual identity.
- Development project management with target, raised amount, status and progress updates.
- Real local image upload for school/gallery photos (JPEG/PNG/WebP, max 2MB per photo).
- Public gallery automatically displays approved uploaded photos.
- Public project cards automatically display admin-created projects.
- Sponsor/well-wisher enquiry form stores enquiries in the browser for the local admin dashboard.
- School contact settings can be managed from the dashboard.
- JSON backup of local CMS data.
- Responsive admin dashboard.

## Run
This version is static. Open `index.html` in a browser, or use VS Code Live Server for the best experience. Open `admin.html` to manage the content.

## Important production note
Version 3 is a functional browser/localStorage CMS, not a secure multi-user production CMS. Data and uploaded photos are stored in the browser used to manage the site. Before publishing as the official school system, connect the forms and dashboard to a secure backend/database, add real authentication/authorization, server-side validation, secure file storage, backups, HTTPS, and verified official payment details.
