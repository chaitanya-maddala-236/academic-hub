# Academic Hub - Quick Setup Guide

This guide will help you get the Academic Hub application running in under 10 minutes.

## Prerequisites

- Node.js v16+ installed
- PostgreSQL v12+ installed and running
- Git

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/chaitanya-maddala-236/academic-hub.git
cd academic-hub

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Setup PostgreSQL Database

```bash
# Login to PostgreSQL (adjust command for your OS)
psql -U postgres

# Create database
CREATE DATABASE research_portal_db;

# Exit psql
\q

# Initialize database schema
psql -U postgres -d research_portal_db -f backend/database/schema.sql
```

**Note**: If you don't have PostgreSQL password set, you may need to configure it or modify `backend/.env` to not include a password.

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=research_portal_db

PORT=5000
NODE_ENV=development

JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

### Frontend Configuration

The frontend `.env` file should already exist with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Step 4: Start the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connection established
✓ Server is running on port 5000
✓ Health check: http://localhost:5000/health
✓ API base URL: http://localhost:5000/api
```

### Terminal 2: Start Frontend

```bash
# From project root
npm run dev
```

You should see:
```
VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

## Step 5: Access the Application

1. Open your browser to: http://localhost:5173
2. Click on "Login"
3. Use test credentials:
   - **Admin**: admin@vnrvjiet.ac.in / Admin@123
   - **Faculty**: faculty@vnrvjiet.ac.in / Faculty@123

## Troubleshooting

### Database Connection Error

If you see "Failed to start server" with database errors:

1. Check PostgreSQL is running:
   ```bash
   # On Linux/Mac
   sudo service postgresql status
   
   # On Windows
   pg_ctl status
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -c "\l" | grep research_portal_db
   ```

3. Check credentials in `backend/.env`

### Port Already in Use

If port 5000 or 5173 is already in use:

**Backend (Port 5000)**:
- Change `PORT=5000` in `backend/.env` to another port
- Update `VITE_API_BASE_URL` in frontend `.env` accordingly

**Frontend (Port 5173)**:
- Vite will automatically use the next available port
- Or specify port: `npm run dev -- --port 3000`

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
rm -rf dist
npm run build
```

## Next Steps

- Explore the dashboard at http://localhost:5173
- Check API health at http://localhost:5000/health
- View API documentation in `backend/API_DOCUMENTATION.md`
- Add your own data through the UI
- Customize the application for your institution

## Default Data

The database schema includes two default users:

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@vnrvjiet.ac.in    | Admin@123   |
| Faculty | faculty@vnrvjiet.ac.in  | Faculty@123 |

## Support

If you encounter issues:

1. Check the console logs in both terminals
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running
4. Check environment variables are correct
5. Create an issue on GitHub with error details

---

**Ready to go!** 🚀 You should now have a fully functional Academic Hub running locally.
