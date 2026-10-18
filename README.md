# Gym Management System (MERN Stack)

A complete Gym Management System built with the **MERN stack** — MongoDB, Express.js, React.js and Node.js — with Bootstrap 5 styling, JWT authentication, and role-based dashboards for Admins and Members.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Bootstrap 5 (CDN), Recharts, Axios, React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (jsonwebtoken) + bcrypt password hashing |
| Styling | Bootstrap 5 + custom CSS (dark sidebar / light content, orange-black theme) |

## Project Structure

```
gym-management/
├── backend/
│   ├── models/          # Mongoose schemas (User, Member, Trainer, Membership, ...)
│   ├── controllers/     # Business logic for each module
│   ├── routes/          # Express API routes
│   ├── middleware/      # JWT auth + admin-only guards
│   ├── scripts/         # createAdmin.js — create the first admin
│   ├── server.js        # Express app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/       # Dashboard, Members, Attendance, Workout, Diet, ...
    │   ├── components/  # Layout (sidebar), ProtectedRoute
    │   ├── AuthContext.jsx
    │   ├── api.js       # Axios instance with JWT interceptor
    │   └── index.css
    └── .env.example
```

## Features

### Admin
- Dashboard with real statistics from MongoDB: members, trainers, plans, revenue, attendance
- Monthly revenue bar chart + membership expiry alerts (next 30 days)
- Members: search, view full details (memberships, BMI, payments), delete
- Trainers: add, edit, delete
- Membership plans: CRUD + assign plans to members (auto end-date + payment recorded)
- Attendance: mark present/absent per member per day
- Workout plans: assign to members with trainer, edit, delete
- Diet plans: assign to members with calories and meals, edit, delete
- Payments: record/edit/delete, revenue + pending totals, status filter
- BMI: view any member's monthly BMI records

### Member
- Personal dashboard: membership status, attendance, total paid, current BMI + trend chart
- BMI Calculator: record monthly height/weight, auto-calculated BMI, one record per month (duplicate months are updated, not duplicated)
- Monthly Progress: BMI + weight charts, total changes since first record
- Notifications: expiry alerts (14 days) + messages with mark-as-read
- Profile: edit name, phone, DOB, address

### Security
- Passwords hashed with bcrypt (never stored or returned in plain text)
- JWT-protected routes; role middleware (`protect`, `adminOnly`) on every admin endpoint
- Members can only access their own data (server-enforced by looking up their linked Member record)
- Public registration always creates role `member` — admins are created only via the admin script
- No card details stored — payments track amount, status and date only

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
npm install

# create your .env file
cp .env.example .env
# then edit .env:
#   MONGO_URI=mongodb://localhost:27017/gym-management
#   (or your Atlas string: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gym-management)
#   JWT_SECRET=any_long_random_string

npm start          # runs on http://localhost:5000
```

### 2. Create the admin account

```bash
cd backend
npm run create-admin "Admin Name" admin@gym.com password123
```

Use these credentials to sign in as admin. Public sign-ups always become regular members.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173 (proxies /api to port 5000)
```

Open http://localhost:5173 and log in.

### MongoDB Atlas (cloud) setup
1. Create a free cluster at mongodb.com/atlas
2. Database Access → add a database user (username + password)
3. Network Access → allow your IP (or 0.0.0.0 for a demo)
4. Copy the connection string into `MONGO_URI` in `backend/.env`

## API Endpoints

Base URL: `http://localhost:5000/api` — protected routes need `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /auth/register | Public | Register (always creates a member) |
| POST | /auth/login | Public | Login, returns JWT |
| GET | /auth/me | Logged in | Get current user |
| PUT | /auth/me | Logged in | Update own profile |

### Dashboard
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /dashboard/admin | Admin | Stats, revenue by month, expiring memberships |
| GET | /dashboard/member | Member | Own stats, BMI history, membership |

### Members
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /members | Admin | List (supports ?search=) |
| GET | /members/:id | Admin | Full member details |
| DELETE | /members/:id | Admin | Delete member + linked user |

### Trainers / Memberships / Attendance / Workouts / Diets / Payments
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /trainers | Logged in | List trainers |
| POST/PUT/DELETE | /trainers[/:id] | Admin | CRUD trainers |
| GET | /memberships | Logged in | List plans |
| POST/PUT/DELETE | /memberships[/:id] | Admin | CRUD plans |
| GET | /memberships/assigned | Admin | All member-plan assignments |
| POST | /memberships/assign | Admin | Assign plan (creates payment too) |
| PUT | /memberships/member-memberships/:id/cancel | Admin | Cancel an assignment |
| GET/POST/DELETE | /attendance[/:id] | Admin | Attendance records |
| GET/POST/PUT/DELETE | /workouts[/:id] | Admin | Workout plans |
| GET/POST/PUT/DELETE | /diet-plans[/:id] | Admin | Diet plans |
| GET/POST/PUT/DELETE | /payments[/:id] | Admin | Payments |

### BMI & Notifications
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /bmi/mine | Member | Own BMI records |
| GET | /bmi/member/:memberId | Admin | Any member's BMI records |
| POST | /bmi | Logged in | Create/update monthly record (upsert per month) |
| DELETE | /bmi/:id | Owner/Admin | Delete a record |
| GET | /notifications/mine | Logged in | Own notifications |
| PUT | /notifications/:id/read | Logged in | Mark one read |
| PUT | /notifications/read-all | Logged in | Mark all read |
| GET | /notifications/expiry-alerts | Logged in | Active plans ending within 14 days |

## BMI Formula

BMI = weight (kg) / height (m)²

Categories: Underweight < 18.5 · Normal 18.5–24.9 · Overweight 25–29.9 · Obese ≥ 30

## Notes for the College Demo

- Seed data (membership plans, trainers) is not inserted automatically — add plans and trainers through the admin UI in a couple of clicks before presenting.
- Registering a new account through the UI creates a member you can immediately use for the member-dashboard demo.
- The app runs fully offline once MongoDB is running locally.
