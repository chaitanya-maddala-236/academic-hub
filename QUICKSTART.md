# Academic Hub - Quick Start Guide

Complete guide to set up and run the Academic Research Management System.

## 🎯 Overview

The Academic Hub is a comprehensive full-stack system for managing university research data including:
- Research Centers & Labs
- Funded Research Projects  
- Publications (Journals & Conferences)
- IPR (Patents, Trademarks, Copyrights)
- Consultancy Projects
- Student Projects (UG/PG)
- Teaching Materials
- Awards & Recognition
- Dashboard Analytics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/chaitanya-maddala-236/academic-hub.git
cd academic-hub
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your database credentials
nano .env  # or use your preferred editor
```

**Required .env variables:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=research_portal_db

PORT=5000
NODE_ENV=production

JWT_SECRET=your_secure_jwt_secret_key_change_this
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE research_portal_db;
\q

# Run schema to create tables
psql -U postgres -d research_portal_db -f database/schema.sql

# (Optional) Seed with sample data
npm run seed
```

### Step 4: Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The API will be available at: `http://localhost:5000/api`

### Step 5: Frontend Setup

```bash
# In a new terminal, navigate to project root
cd academic-hub

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🔑 Default Login Credentials

Use these credentials to log in and test the system:

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@vnrvjiet.ac.in       | Admin@123   |
| Faculty | faculty@vnrvjiet.ac.in     | Faculty@123 |
| Student | student@vnrvjiet.ac.in     | Student@123 |

**⚠️ Important:** Change these passwords after first login in production!

## 📚 Testing the API

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vnrvjiet.ac.in","password":"Admin@123"}'
```

### Get Dashboard Stats
```bash
# First, get the token from login response
TOKEN="your_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/dashboard/stats
```

## 📖 API Documentation

For complete API reference with all endpoints, request/response examples, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [Backend README](./README.md)

## 🗄️ Database Structure

The system includes the following main tables:

### Core Tables
- **users** - Authentication (admin, faculty, student, public)
- **faculty** - Faculty profiles and information

### Research & Academic
- **research_centers** - Research centers and labs
- **funded_projects** - Research projects with funding details
- **publications** - Journal and conference publications
- **ipr** - Patents, trademarks, copyrights
- **consultancy** - Consultancy projects and revenue

### Education
- **student_projects** - UG/PG student projects
- **teaching_materials** - Course materials (PPT, PDF, videos)

### Recognition
- **awards** - Faculty and student awards

See `backend/database/schema.sql` for complete schema.

## 🎨 Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Research Centers
- `GET /api/research-centers` - List all
- `GET /api/research-centers/:id` - Get single
- `POST /api/research-centers` - Create (Admin)
- `PUT /api/research-centers/:id` - Update (Admin)
- `DELETE /api/research-centers/:id` - Delete (Admin)

### Research Projects
- `GET /api/projects` - List all with filters
- `GET /api/projects/:id` - Get single
- `POST /api/projects` - Create (Admin)
- `PUT /api/projects/:id` - Update (Admin)
- `DELETE /api/projects/:id` - Delete (Admin)

### IPR (Intellectual Property)
- `GET /api/ipr` - List all
- `GET /api/ipr/:id` - Get single
- `POST /api/ipr` - Create (Admin)
- `PUT /api/ipr/:id` - Update (Admin)
- `DELETE /api/ipr/:id` - Delete (Admin)

### Consultancy
- `GET /api/consultancy` - List all
- `GET /api/consultancy/:id` - Get single
- `POST /api/consultancy` - Create (Admin)
- `PUT /api/consultancy/:id` - Update (Admin)
- `DELETE /api/consultancy/:id` - Delete (Admin)

### Publications
- `GET /api/publications` - List all
- `GET /api/publications/:id` - Get single
- `POST /api/publications` - Create (Admin)
- `PUT /api/publications/:id` - Update (Admin)
- `DELETE /api/publications/:id` - Delete (Admin)

### Student Projects
- `GET /api/student-projects` - List all
- `GET /api/student-projects/:id` - Get single
- `POST /api/student-projects` - Create (Admin/Faculty)
- `PUT /api/student-projects/:id` - Update (Admin/Faculty)
- `DELETE /api/student-projects/:id` - Delete (Admin)

### Teaching Materials
- `GET /api/materials` - List all (Auth required)
- `GET /api/materials/:id` - Get single (Auth required)
- `POST /api/materials` - Create (Admin/Faculty)
- `PUT /api/materials/:id` - Update (Admin/Faculty)
- `DELETE /api/materials/:id` - Delete (Admin/Faculty)

### Awards
- `GET /api/awards` - List all
- `GET /api/awards/:id` - Get single
- `POST /api/awards` - Create (Admin)
- `PUT /api/awards/:id` - Update (Admin)
- `DELETE /api/awards/:id` - Delete (Admin)

### Dashboard Analytics (Admin Only)
- `GET /api/dashboard/stats` - Overall statistics
- `GET /api/dashboard/publications-per-year` - Publication trends
- `GET /api/dashboard/patent-growth` - IPR growth
- `GET /api/dashboard/consultancy-revenue` - Revenue trends
- `GET /api/dashboard/department-comparison` - Department-wise stats

## 🔐 Role-Based Access

| Feature | Admin | Faculty | Student | Public |
|---------|-------|---------|---------|--------|
| View Public Data | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Research Data | ✅ | ❌ | ❌ | ❌ |
| Upload Student Projects | ✅ | ✅ | ❌ | ❌ |
| View Teaching Materials | ✅ | ✅ | ✅ | ❌ |
| Upload Teaching Materials | ✅ | ✅ | ❌ | ❌ |
| View Dashboard Analytics | ✅ | ❌ | ❌ | ❌ |

## 🛠️ Development

### Project Structure

```
academic-hub/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & validation
│   ├── routes/             # API routes
│   ├── database/           # Schema & seed files
│   └── server.js           # Entry point
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   └── main.tsx            # Entry point
└── README.md
```

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd ..
npm test
```

### Building for Production

```bash
# Frontend build
npm run build

# The build will be in the dist/ folder
```

## 🚢 Deployment

### Backend Deployment

The backend can be deployed to:
- Render
- Railway
- Heroku
- DigitalOcean
- AWS EC2
- Any VPS with Node.js support

**Environment Variables:** Make sure to set all required environment variables on your hosting platform.

### Database Deployment

Use managed PostgreSQL services:
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Database
- Railway PostgreSQL

### Frontend Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

## 📊 Sample Data

The seed script creates sample data for:
- 4 Faculty members
- 3 Research centers
- 3 Funded projects
- 3 Publications
- 3 IPR records
- 2 Consultancy projects
- 3 Student projects
- 3 Awards
- 2 Teaching materials

Run `npm run seed` to populate your database.

## 🔧 Troubleshooting

### Database Connection Error
```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```
**Solution:** Make sure your `.env` file has a valid DB_PASSWORD set.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in `.env` file or kill the process using port 5000.

### JWT Token Invalid
```
Error: Invalid or expired token
```
**Solution:** Make sure JWT_SECRET is set in `.env` and matches between environments.

## 📝 Next Steps

After setup:

1. **Change default passwords** - Update admin/faculty/student passwords
2. **Add your data** - Use the API or frontend to add your institution's data
3. **Customize branding** - Update logos, colors, and institution name
4. **Configure file storage** - Set up S3 or local storage for PDFs
5. **Enable SSL** - Use HTTPS in production
6. **Set up backups** - Regular database backups
7. **Monitor logs** - Set up logging and monitoring

## 📧 Support

For issues or questions:
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [Backend README](./README.md)
- Create an issue on GitHub

## 📄 License

ISC

---

**Built with:**
- Backend: Node.js, Express, PostgreSQL, JWT
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Authentication: JWT with role-based access control
