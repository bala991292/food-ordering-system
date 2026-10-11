# Online Food Ordering System (Tiffin Box)

Full-stack app: **React (Vite)** + **Spring Boot 3 (Java 17)** + **MySQL 8**, with REST APIs, Spring Data JPA, JWT login and role-based access (Customer / Admin).

## Features
**Customer:** register / log in, browse and search the menu, filter by category, add to cart, place order with name/phone/address, track order status (auto-refreshes).
**Admin:** add / edit / delete food items, toggle availability, manage categories, view current and past orders, update order status.

## Project layout
```
backend/    Spring Boot API (model, repository, service, controller, security, exception)
frontend/   React app (pages, cart + auth context, API client)
docker-compose.yml
```

## Run locally (without Docker)
Prerequisites: Java 17, Maven, Node 18+, MySQL running locally.

```bash
# 1. Backend  (http://localhost:8080)
cd backend
# defaults: MySQL at localhost:3306, user root / password root. Override with env vars if different:
#   DB_URL, DB_USER, DB_PASSWORD
mvn spring-boot:run

# 2. Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```
Tables are created automatically (`ddl-auto=update`) and sample menu data is seeded on first start.

**Default admin:** `admin@food.com` / `Admin@123` (change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` before deploying).

## Run everything with Docker
```bash
docker compose up --build
```
Open http://localhost:3000.

## API summary
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/foods, /api/foods/{id}, /api/categories | public |
| POST/PUT/DELETE | /api/foods, /api/categories | admin |
| POST | /api/orders | logged in |
| GET | /api/orders/my | logged in |
| GET | /api/admin/orders | admin |
| PUT | /api/admin/orders/{id}/status  body `{"status":"PREPARING"}` | admin |

Statuses: `PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`.

---

# Deployment

Push this folder to a GitHub repo first. Three pieces are needed: a MySQL database, the backend, the frontend.

## Option A: Railway (backend + MySQL) and Vercel (frontend)

### 1. Database + backend on Railway
1. railway.app → New Project → **Provision MySQL**.
2. In the same project: **New → GitHub Repo** → pick your repo. In the service settings set **Root Directory = `backend`** (Railway detects the Dockerfile).
3. In the backend service → **Variables**, add:
   ```
   DB_URL        = jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USER       = ${{MySQL.MYSQLUSER}}
   DB_PASSWORD   = ${{MySQL.MYSQLPASSWORD}}
   JWT_SECRET    = <random string, 32+ characters>
   ADMIN_EMAIL   = <your admin email>
   ADMIN_PASSWORD= <strong password>
   CORS_ORIGINS  = https://YOUR-FRONTEND.vercel.app   (set after step 2, then redeploy)
   ```
   If your MySQL service is named differently, replace `MySQL` in the references.
4. **Settings → Networking → Generate Domain**. Test: `https://<backend-domain>/api/foods` should return JSON.

### 2. Frontend on Vercel
1. vercel.com → Add New Project → import the repo → **Root Directory = `frontend`** (Framework: Vite).
2. Environment variable: `VITE_API_URL = https://<backend-domain>` (no trailing slash).
3. Deploy. Copy the Vercel URL into the backend's `CORS_ORIGINS` and redeploy the backend.

## Option B: Render (backend) + Netlify/Vercel (frontend) + external MySQL
- Render has no managed MySQL, so create a free/cheap MySQL on Aiven, Railway, or PlanetScale-compatible host and use its host/port/user/password in `DB_URL`, `DB_USER`, `DB_PASSWORD`.
- Render → New **Web Service** → repo → Root Directory `backend`, Runtime **Docker**. Add the same env vars as above. Render sets `PORT` automatically (already supported).
- Frontend: Netlify/Vercel as in step 2 (SPA redirects are already included).

## Option C: One VPS (EC2 / DigitalOcean / any Ubuntu server)
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
git clone <your-repo> && cd food-ordering-system
# edit docker-compose.yml: set strong passwords/JWT_SECRET,
# set frontend build arg VITE_API_URL=http://<server-ip>:8080 and backend CORS_ORIGINS=http://<server-ip>:3000
sudo docker compose up -d --build
```
Open ports 3000 and 8080 in the firewall. For a real domain + HTTPS, put Nginx/Caddy in front.

## Production checklist
- Set a long random `JWT_SECRET` and change the admin password.
- `CORS_ORIGINS` must exactly match the frontend URL (including `https://`, no trailing slash).
- Free tiers sleep when idle; the first request after a pause can take 30-60 s.
- Frontend env vars are baked in at build time: if you change `VITE_API_URL`, redeploy the frontend.

## Ideas for later (from the proposal)
Online payment, delivery tracking, reviews, coupons, e-mail notifications, reports.
