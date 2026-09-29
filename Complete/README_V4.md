# Cheptulel Boys Senior School — Version 4

Secure backend upgrade for the V3 website.

## Stack
- Frontend: existing responsive HTML/CSS/JavaScript website
- Backend: Python Flask REST API
- Database: SQLite by default; change DATABASE_URL for PostgreSQL/MySQL
- Authentication: JWT access tokens + hashed admin passwords
- Images: secure server storage by default, optional Cloudinary cloud storage configuration
- CORS: configurable allowed origins

## 1. Backend setup on Windows
Open CMD/PowerShell in the `backend` folder:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env`. **Change both secret keys and the administrator password before deployment.**

Start the API:
```powershell
python run.py
```
API: http://127.0.0.1:5000

## 2. Frontend
Use VS Code Live Server on the project root and open `index.html`.
The admin dashboard is `admin.html`.

Default development administrator comes from `.env`:
- email: `admin@cheptulel.example`
- password: `ChangeThisImmediately123!`

Change these before using the system.

## 3. Production database
Set `DATABASE_URL` to a managed PostgreSQL database, for example:
`postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME`
Install the matching PostgreSQL driver if needed.

## 4. Cloudinary image storage (optional)
Create a Cloudinary account and put the cloud name, API key and API secret in `.env`. The current API contains the secure server upload path; for a production deployment, connect `save_image()` to Cloudinary's authenticated upload API and return its HTTPS URL. Never expose the Cloudinary API secret in frontend code.

## 5. Production security checklist
- Use HTTPS.
- Use long random SECRET_KEY and JWT_SECRET_KEY values.
- Set CORS_ORIGINS to the exact school website domain, not `*`.
- Change the default admin password.
- Put the database on a managed/private service and back it up.
- Store uploaded images in cloud/object storage for scale.
- Run Flask behind Gunicorn/waitress/reverse proxy rather than debug mode.
- Add rate limiting/WAF and email notifications for sponsor enquiries before public launch.
- Publish only verified school contacts and official payment information.
