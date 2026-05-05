# Personal Finance Tracker
### DG1IAD Portfolio 3 — Internet Application and Databases

A full-stack personal finance tracker built with **Next.js**, **MySQL**, and **bcrypt** authentication.

---

## Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | Next.js (React), CSS Modules |
| Backend   | Next.js API Routes (equivalent to PHP) |
| Database  | MySQL 8+           |
| Auth      | bcrypt + JWT (httpOnly cookies) |
| Charts    | Recharts           |

---

## Features

- **User Management** — Register, login, logout with hashed passwords (bcrypt)
- **Transaction CRUD** — Add, edit, delete, view income & expenses
- **Categories** — Assign categories stored in the database
- **Analytics** — Bar chart (monthly), pie chart (by category), savings rate
- **Secure** — JWT tokens in httpOnly cookies, ownership checks on all mutations

---

## Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your MySQL credentials and a secret key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
finance-tracker/
├── database/
│   └── schema.sql          # MySQL schema + seed data
├── lib/
│   ├── db.js               # MySQL connection pool
│   └── auth.js             # JWT helpers
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js    # POST /api/auth/login
│   │   │   ├── logout.js   # POST /api/auth/logout
│   │   │   └── register.js # POST /api/auth/register
│   │   ├── transactions/
│   │   │   ├── index.js    # GET / POST /api/transactions
│   │   │   ├── [id].js     # PUT / DELETE /api/transactions/:id
│   │   │   └── summary.js  # GET /api/transactions/summary
│   │   └── categories/
│   │       └── index.js    # GET /api/categories
│   ├── dashboard.js        # Summary + recent transactions
│   ├── tracker.js          # Full CRUD transaction table
│   ├── analytics.js        # Charts & insights
│   ├── profile.js          # User profile
│   ├── login.js
│   └── register.js
├── components/
│   ├── Layout.js           # Sidebar + auth guard
│   └── Sidebar.js          # Navigation
└── styles/                 # CSS Modules
```

---

## Database Schema (3NF)

```sql
users        (user_id PK, username, email, password_hash)
categories   (category_id PK, name)
transactions (transaction_id PK, user_id FK, category_id FK, amount, type, description, date)
```

All tables satisfy 3rd Normal Form — no transitive dependencies.

---

## API Endpoints

| Method | Endpoint                     | Description               |
|--------|------------------------------|---------------------------|
| POST   | /api/auth/register           | Create account            |
| POST   | /api/auth/login              | Authenticate              |
| POST   | /api/auth/logout             | Clear session             |
| GET    | /api/transactions            | List user's transactions  |
| POST   | /api/transactions            | Add transaction           |
| PUT    | /api/transactions/:id        | Edit transaction          |
| DELETE | /api/transactions/:id        | Delete transaction        |
| GET    | /api/transactions/summary    | Analytics data            |
| GET    | /api/categories              | List categories           |
