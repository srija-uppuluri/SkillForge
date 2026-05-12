# SkillForge — Time-Based Learning Exchange Platform

Exchange skills using time credits instead of money. Teach 1 hour = earn 1 credit.

## Tech Stack

- **Frontend:** React 18 + Tailwind CSS + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT + bcrypt

## Setup

### Prerequisites
- Node.js 18+

### 1. Install Dependencies

```bash
npm install
cd client && npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This creates the `skill_swap.db` file with all tables and seeds sample data (5 users, 10 skills).

### 3. Run the Application

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Demo Accounts

All seeded users have password: `password123`

| Name | Email | Credits |
|------|-------|---------|
| Alice Johnson | alice@example.com | 5 |
| Bob Smith | bob@example.com | 5 |
| Carol Williams | carol@example.com | 5 |
| David Brown | david@example.com | 5 |
| Eva Martinez | eva@example.com | 5 |

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
| PUT | /api/requests/:id/accept | Yes | Accept + schedule session |
| PUT | /api/requests/:id/reject | Yes | Reject request |
| PUT | /api/requests/:id/start | Yes | Start video session |
| PUT | /api/requests/:id/confirm | Yes | Confirm session complete |
| GET | /api/transactions | Yes | Transaction history |
| POST | /api/feedback | Yes | Submit feedback |
| GET | /api/feedback/teacher/:id | No | Get teacher reviews |
| GET | /api/dashboard | Yes | Dashboard data |
| GET | /api/users/me | Yes | Current user profile |
| GET | /api/users/:id | No | Public user profile |

## Business Logic

- New users start with 5 credits
- Learner must have sufficient credits to send a request
- Teacher accepts and schedules a date/time for the session
- Video session starts at the scheduled time
- Both teacher AND learner must confirm session is complete
- Credits transfer atomically only when both parties confirm
- Status flow: Pending → Scheduled → In Progress → Completed (or Rejected)
- One feedback entry per completed request (rating 1-5 + comments)

## Features

- Dark/Light mode toggle
- Video session interface with camera, mic, chat
- Session scheduling with date/time picker
- Mutual completion confirmation (anti-fraud)
- Animated UI with Tailwind CSS
- Responsive design (mobile + desktop)
