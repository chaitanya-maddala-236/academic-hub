# Academic Hub - University Research Management System

A full-stack web application for managing university research data including publications, patents, IP assets, funded projects, research labs, faculty profiles, and student projects.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Faculty, Student, Public)
- Secure password hashing with bcrypt

### Research Management
- **Publications**: Manage journals, conferences with DOI tracking
- **Patents**: Track patent filings and grants
- **IP Assets**: Intellectual property management
- **Funded Projects**: Research project management with agency tracking
- **Research Labs**: Laboratory information and equipment tracking
- **Faculty Profiles**: Complete faculty information with publications and projects
- **Student Projects**: Major/minor project submissions
- **Teaching Materials**: Course materials and resources
- **Awards & Recognition**: Track achievements and honors
- **Consultancy**: Consultancy project tracking

### Analytics & Reporting
- Dashboard with key metrics
- Publication trends
- Patent growth tracking
- Department-wise comparisons
- Consultancy revenue tracking

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Security**: express-rate-limit, CORS, input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/chaitanya-maddala-236/academic-hub.git
cd academic-hub
```

### 2. Setup PostgreSQL Database

#### Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE research_portal_db;

# Exit psql
\q
```

#### Initialize Database Schema

```bash
# Run the schema file to create tables
psql -U postgres -d research_portal_db -f backend/database/schema.sql
```

The schema includes:
- Users table with role-based access
- Faculty profiles
- Publications (journals & conferences)
- Patents and IP assets
- Funded projects
- Research labs
- Student projects
- Teaching materials
- Awards and consultancy records

### 3. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=research_portal_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The backend server will start on `http://localhost:5000`

### 4. Frontend Setup

#### Install Dependencies

```bash
# From the project root
npm install
```

#### Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔑 Default Test Accounts

The database schema includes default test users:

| Role    | Email                      | Password   |
|---------|----------------------------|------------|
| Admin   | admin@vnrvjiet.ac.in      | Admin@123  |
| Faculty | faculty@vnrvjiet.ac.in    | Faculty@123|

## 📁 Project Structure

```
academic-hub/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── database/           # Database schema and migrations
│   ├── middleware/         # Auth, validation, error handling
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads directory
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
│
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   │   ├── api.ts          # API client
│   │   └── auth.service.ts # Authentication service
│   ├── lib/                # Utilities
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
│
├── public/                 # Static assets
├── .env                    # Frontend environment variables
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Resource Endpoints

All resources follow REST conventions:

- `GET /api/{resource}` - List all
- `GET /api/{resource}/:id` - Get one
- `POST /api/{resource}` - Create (requires auth)
- `PUT /api/{resource}/:id` - Update (requires auth)
- `DELETE /api/{resource}/:id` - Delete (requires admin)

Available resources:
- `/api/faculty`
- `/api/publications`
- `/api/patents`
- `/api/ip-assets`
- `/api/projects`
- `/api/labs`
- `/api/consultancy`
- `/api/materials`
- `/api/awards`
- `/api/student-projects`
- `/api/dashboard` (admin only)

For detailed API documentation, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

### Backend Deployment

```bash
cd backend

# Set NODE_ENV to production
export NODE_ENV=production

# Start server
npm start
```

**Important**: 
- Update `JWT_SECRET` to a strong secret key
- Configure PostgreSQL for production
- Update `CORS_ORIGIN` to your frontend domain
- Use environment-specific `.env` files

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- CORS protection
- Secure file upload validation

## 📝 Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests (if available)
cd backend
npm test
```

### Linting

```bash
# Frontend
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact: chaitanya-maddala-236

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] NAAC/NIRF report generation
- [ ] Google Scholar integration
- [ ] Advanced search and filtering
- [ ] Data export features (CSV, PDF)
- [ ] Mobile responsive improvements
- [ ] Multi-language support

---

**Built with ❤️ for Academic Research Management**
