# E-Learning Platform

A modern e-learning platform built with Next.js frontend connected to Moodle LMS backend.

## Architecture

- **Frontend**: Next.js 15 + React 18 + TypeScript + Tailwind CSS
- **API Layer**: Express.js adapter translating frontend API to Moodle REST Web Services
- **Backend**: Moodle 5.1 running on XAMPP (Apache + MariaDB + PHP)

## Quick Start

### 1. Start Moodle Server
Run `Start Moodle.exe` or execute:
```bash
cd server
apache_start.bat
```
Access Moodle at http://localhost/

### 2. Start API Adapter
```bash
cd adapter
npm install
node index.js
```
Adapter runs on http://localhost:3001

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## Project Structure

```
Moodle/
├── server/              # XAMPP Moodle installation
├── adapter/             # Express.js API bridge
├── frontend/            # Next.js frontend (to be created)
└── FRONTEND_REMAPPING_PLAN.md  # Detailed implementation plan
```

## Features

- User authentication (Student, Teacher, Admin roles)
- Course browsing and enrollment
- Student dashboard with progress tracking
- Teacher dashboard with course management
- Admin dashboard with user management
- Quiz viewing and taking
- Modern, responsive UI

## Documentation

See [FRONTEND_REMAPPING_PLAN.md](./FRONTEND_REMAPPING_PLAN.md) for detailed implementation status and API reference.
