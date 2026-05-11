# Skill Swap — Time-Based Learning Exchange Platform

Exchange skills using time credits instead of money. Teach 1 hour = earn 1 credit.

## Tech Stack

- **Frontend:** React 18 + Tailwind CSS + React Router
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT + bcrypt

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Configure Environment

Copy `.env.example` to `.env` and update your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=skill_swap
JWT_SECRET=your_secret_key
PORT=5000
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Create & Seed Database

Make sure MySQL is running, then:

```bash
npm run seed
```

This creates the `skill_swap` database, all tables, and seeds sample data (5 users, 10 skills, requests, transactions, and feedback).

### 4. Run the Application

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Demo Accounts

All seeded users have password: `password123`

| Name | Email | Credits |
|------|-------|---------|
| Alice Johnson | alice@example.com | 10 |
| Bob Smith | bob@example.com | 8 |
| Carol Williams | carol@example.com | 12 |
| David Brown | david@example.com | 6 |
| Eva Martinez | eva@example.com | 15 |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/skills | No | Browse all skills |
| GET | /api/skills/categories | No | Get categories |
| GET | /api/skills/my | Yes | Get user's skills |
| POST | /api/skills | Yes | Create skill |
| PUT | /api/skills/:id | Yes | Update skill |
| DELETE | /api/skills/:id | Yes | Delete skill |
| GET | /api/requests/incoming | Yes | Incoming requests |
| GET | /api/requests/outgoing | Yes | Outgoing requests |
| POST | /api/requests | Yes | Create request |
| PUT | /api/requests/:id/accept | Yes | Accept request |
| PUT | /api/requests/:id/reject | Yes | Reject request |
| PUT | /api/requests/:id/complete | Yes | Complete session (atomic) |
| GET | /api/transactions | Yes | Transaction history |
| POST | /api/feedback | Yes | Submit feedback |
| GET | /api/feedback/teacher/:id | No | Get teacher reviews |
| GET | /api/dashboard | Yes | Dashboard data |
| GET | /api/users/me | Yes | Current user profile |
| GET | /api/users/:id | No | Public user profile |

## Business Logic

- New users start with 5 credits
- Learner must have sufficient credits to send a request
- On session completion: atomic DB transaction debits learner, credits teacher
- Status flow: Pending → Accepted → Completed (or Rejected)
- One feedback entry per completed request (rating 1-5 + comments)
