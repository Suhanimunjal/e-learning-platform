# E-Learning Platform

A full-stack e-learning platform with AI-powered features, quizzes, course management, and more.

## Project Structure

```
e-learning-platform/
├── backend/          # NestJS API server
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── .env          # Environment config
├── frontend/         # Next.js React app
│   ├── src/          # Source code
│   └── .env.local    # Environment config
└── README.md
```

## Quick Start

### 1. Setup PostgreSQL Database

```sql
CREATE USER lms_user WITH PASSWORD 'lms_password';
CREATE DATABASE lms_db OWNER lms_user;
```

### 2. Start Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Backend runs on `http://localhost:3001`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

- **Course Management** - Create and manage courses
- **AI Content Generation** - Generate lessons and quizzes with AI
- **Quiz System** - Create quizzes, auto-grade with AI
- **Grading Dashboard** - AI-powered grading with teacher override
- **Subscriptions** - Razorpay integration for payments
- **Analytics** - Track student progress and course stats
- **Plugins** - 50+ extensible plugins

## Documentation

- `README_NO_DOCKER.md` - Detailed setup guide
- `HARDCODED_VALUES.md` - Implementation status
- `TESTING_GUIDE.md` - Testing instructions

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, Redis (optional), Bull queue
- **Frontend**: Next.js 15, React, Tailwind CSS
- **AI**: Anthropic Claude API, Google Gemini, Google Cloud TTS
- **Payments**: Razorpay
