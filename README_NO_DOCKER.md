# Running the E-Learning Platform Without Docker

## Prerequisites

You need to install the following on your machine:

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org/

### 2. PostgreSQL (v14 or higher)
Download from: https://www.postgresql.org/download/

**During installation, note your:**
- Host: `localhost`
- Port: `5432` (default)
- Username: `postgres` (or your chosen username)
- Password: (your chosen password)

### 3. Redis (OPTIONAL - for AI job queue)
Download from: https://redis.io/download/

Redis is only needed if you want AI features (course generation, quiz generation) to run in the background. Without it, AI features still work but run synchronously (you'll wait for the response).

---

## Setup Instructions

### Step 1: Create the Database

1. Open pgAdmin (comes with PostgreSQL) or use psql:

```sql
-- Connect to PostgreSQL as postgres user
CREATE USER lms_user WITH PASSWORD 'lms_password';
CREATE DATABASE lms_db OWNER lms_user;
```

Or via command line:
```bash
psql -U postgres -c "CREATE USER lms_user WITH PASSWORD 'lms_password';"
psql -U postgres -c "CREATE DATABASE lms_db OWNER lms_user;"
```

### Step 2: Configure Environment

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://lms_user:lms_password@localhost:5432/lms_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001

# Get these from https://console.anthropic.com/ and https://makersuite.google.com/
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Run Database Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### Step 5: Start the Backend

```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3001`

### Step 6: Start the Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

---

## Quick Start (If You Already Have PostgreSQL Running)

1. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE lms_db;"
psql -U postgres -c "CREATE USER lms_user WITH PASSWORD 'lms_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;"
```

2. Update `backend/.env` with your PostgreSQL credentials

3. Run migrations:
```bash
cd backend
npx prisma migrate deploy
```

4. Start:
```bash
npm run start:dev
```

---

## Troubleshooting

### "Connection refused" errors

1. **PostgreSQL not running:**
   ```bash
   # Windows - Start PostgreSQL service
   net start postgresql-x64-14
   ```

2. **Wrong credentials in DATABASE_URL:**
   Check your `.env` matches your PostgreSQL setup

### "Redis connection refused" (optional)

This is just a warning - AI features will work but slightly slower:
```
[LMS] Redis not available - AI jobs will run synchronously
```

To fix Redis:
- Install Redis from https://redis.io/download/
- Start with `redis-server`

### "Cannot find module" errors

```bash
cd apps/backend
npm install
```

---

## Testing the Setup

1. Backend health check:
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"ok",...}`

2. Frontend:
Open http://localhost:3000 in your browser

---

## Optional: Redis Installation

### Windows
Download from: https://github.com/microsoftarchive/redis/releases

Or use WSL2 with Ubuntu and install via:
```bash
sudo apt install redis-server
```

### macOS
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```
