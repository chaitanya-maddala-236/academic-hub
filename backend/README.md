# University Research Management System - Backend API

A production-ready REST API backend for managing university research data including publications, patents, IP assets, funded projects, research labs, research centers, consultancy, student projects, teaching materials, awards, and faculty information.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Faculty, Student, Public)
- **Research Centers**: Management of research centers with detailed information
- **Funded Projects**: Comprehensive project tracking with agency details, PI/CoPI, objectives, deliverables, and outcomes
- **IPR Management**: Patents, Trademarks, and Copyrights tracking with status monitoring
- **Consultancy**: Track consultancy projects and revenue
- **Publications**: Complete publication management with filtering and pagination
- **Student Projects**: UG/PG project management with guide assignment
- **Teaching Materials**: Secure repository for course materials (PPT, PDF, Video links)
- **Awards & Recognition**: Track faculty and student achievements
- **Dashboard Analytics**: Comprehensive analytics for admin with statistics, charts, and department comparisons
- **Faculty Management**: CRUD operations with profile image upload
- **Patents**: Patent tracking and management
- **IP Assets**: Intellectual property asset management
- **Research Labs**: Research laboratory information with image upload
- **File Upload**: Support for profile images, documents, and materials
- **Filtering & Pagination**: Server-side filtering and pagination on all list endpoints
- **Relationships**: Faculty linked to publications, patents, projects, and more

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=research_portal_db
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Setup PostgreSQL Database**

   Create the database:
   ```bash
   psql -U postgres
   CREATE DATABASE research_portal_db;
   \q
   ```

   Run the schema file to create tables:
   ```bash
   psql -U postgres -d research_portal_db -f database/schema.sql
   ```

   (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

5. **Start the server**

   Development mode with auto-reload:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123",
  "role": "public"  // admin | faculty | student | public
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

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@university.edu",
      "role": "public"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Faculty Endpoints

- `GET /api/faculty` - Get all faculty (supports filters: department, search, sortByPublications, page, limit)
- `GET /api/faculty/:id` - Get single faculty with related publications, patents, and projects
- `POST /api/faculty` - Create faculty (Admin only, supports multipart/form-data for profile_image)
- `PUT /api/faculty/:id` - Update faculty (Admin/Faculty only)
- `DELETE /api/faculty/:id` - Delete faculty (Admin only)

### Publications Endpoints

- `GET /api/publications` - Get all publications (supports filters: year, publication_type, department, indexing, search, faculty_id, page, limit)
- `GET /api/publications/:id` - Get single publication
- `POST /api/publications` - Create publication (Admin only)
- `PUT /api/publications/:id` - Update publication (Admin only)
- `DELETE /api/publications/:id` - Delete publication (Admin only)

### Patents Endpoints

- `GET /api/patents` - Get all patents (supports filters: status, year, department, search, page, limit)
- `GET /api/patents/:id` - Get single patent
- `POST /api/patents` - Create patent (Admin only)
- `PUT /api/patents/:id` - Update patent (Admin only)
- `DELETE /api/patents/:id` - Delete patent (Admin only)

### IP Assets Endpoints

- `GET /api/ip-assets` - Get all IP assets (supports filters: type, department, commercialized, year, page, limit)
- `GET /api/ip-assets/:id` - Get single IP asset
- `POST /api/ip-assets` - Create IP asset (Admin only)
- `PUT /api/ip-assets/:id` - Update IP asset (Admin only)
- `DELETE /api/ip-assets/:id` - Delete IP asset (Admin only)

### Funded Projects Endpoints

- `GET /api/projects` - Get all projects (supports filters: status, department, agency, year, page, limit)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

**Enhanced Fields:** Now includes agency, agency_scientist, file_number, amount_sanctioned, funds_per_year, pi, copi, objectives, deliverables, outcomes, team, and more.

**Note**: Project status (ongoing/completed/upcoming) is automatically calculated based on start_date and end_date.

### Research Centers Endpoints

- `GET /api/research-centers` - Get all research centers (supports filters: department, research_area, page, limit)
- `GET /api/research-centers/:id` - Get single research center
- `POST /api/research-centers` - Create research center (Admin only)
- `PUT /api/research-centers/:id` - Update research center (Admin only)
- `DELETE /api/research-centers/:id` - Delete research center (Admin only)

### IPR Endpoints

- `GET /api/ipr` - Get all IPR (supports filters: type, status, department, year, page, limit)
- `GET /api/ipr/:id` - Get single IPR
- `POST /api/ipr` - Create IPR (Admin only)
- `PUT /api/ipr/:id` - Update IPR (Admin only)
- `DELETE /api/ipr/:id` - Delete IPR (Admin only)

**Types:** Patent, Trademark, Copyright  
**Status:** Filed, Published, Granted, Rejected

### Consultancy Endpoints

- `GET /api/consultancy` - Get all consultancy (supports filters: department, faculty_id, status, year, page, limit)
- `GET /api/consultancy/:id` - Get single consultancy
- `POST /api/consultancy` - Create consultancy (Admin only)
- `PUT /api/consultancy/:id` - Update consultancy (Admin only)
- `DELETE /api/consultancy/:id` - Delete consultancy (Admin only)

### Student Projects Endpoints

- `GET /api/student-projects` - Get all student projects (supports filters: project_type, department, guide_id, year, page, limit)
- `GET /api/student-projects/:id` - Get single student project
- `POST /api/student-projects` - Create student project (Admin/Faculty)
- `PUT /api/student-projects/:id` - Update student project (Admin/Faculty)
- `DELETE /api/student-projects/:id` - Delete student project (Admin only)

**Project Types:** UG, PG

### Teaching Materials Endpoints

- `GET /api/materials` - Get all teaching materials (Authenticated users only)
- `GET /api/materials/:id` - Get single teaching material (Authenticated users only)
- `POST /api/materials` - Create teaching material (Admin/Faculty)
- `PUT /api/materials/:id` - Update teaching material (Admin/Faculty)
- `DELETE /api/materials/:id` - Delete teaching material (Admin/Faculty)

**Material Types:** PPT, PDF, Video

### Awards Endpoints

- `GET /api/awards` - Get all awards (supports filters: recipient_type, faculty_id, year, page, limit)
- `GET /api/awards/:id` - Get single award
- `POST /api/awards` - Create award (Admin only)
- `PUT /api/awards/:id` - Update award (Admin only)
- `DELETE /api/awards/:id` - Delete award (Admin only)

**Recipient Types:** Faculty, Student, Department

### Dashboard Analytics Endpoints (Admin Only)

- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics
- `GET /api/dashboard/publications-per-year` - Get publications trend
- `GET /api/dashboard/patent-growth` - Get IPR/patent growth data
- `GET /api/dashboard/consultancy-revenue` - Get consultancy revenue by year
- `GET /api/dashboard/department-comparison` - Get department-wise comparison

### Research Labs Endpoints

- `GET /api/labs` - Get all labs (supports filters: department, research_area, page, limit)
- `GET /api/labs/:id` - Get single lab
- `POST /api/labs` - Create lab (Admin only, supports multipart/form-data for image)
- `PUT /api/labs/:id` - Update lab (Admin only)
- `DELETE /api/labs/:id` - Delete lab (Admin only)

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token_here
```

### Standard Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Parameterized SQL queries to prevent SQL injection
- Input validation with express-validator
- CORS configuration
- Global error handling
- Environment variable protection

## 🗄️ Database Schema

The database includes the following tables:
- `users` - User authentication (supports admin, faculty, student, public roles)
- `faculty` - Faculty information
- `research_centers` - Research centers and their details
- `funded_projects` - Funded research projects with comprehensive fields
- `ipr` - Intellectual Property Rights (Patents, Trademarks, Copyrights)
- `consultancy` - Consultancy projects and revenue
- `publications` - Research publications
- `student_projects` - UG/PG student projects
- `teaching_materials` - Course materials (PPT, PDF, Videos)
- `awards` - Awards and recognitions
- `patents` - Patent records (legacy table, use `ipr` for new records)
- `ip_assets` - Intellectual property assets (legacy table)
- `research_labs` - Research laboratory information

See `database/schema.sql` for complete schema definition.

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js                  # Database configuration
├── controllers/
│   ├── auth.controller.js     # Authentication logic
│   ├── faculty.controller.js  # Faculty operations
│   ├── publications.controller.js
│   ├── patents.controller.js
│   ├── ipAssets.controller.js
│   ├── projects.controller.js
│   └── labs.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── faculty.routes.js
│   ├── publications.routes.js
│   ├── patents.routes.js
│   ├── ipAssets.routes.js
│   ├── projects.routes.js
│   └── labs.routes.js
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   ├── role.middleware.js     # Role-based access
│   └── error.middleware.js    # Global error handler
├── database/
│   └── schema.sql             # Database schema
├── uploads/                   # File upload directory
├── server.js                  # Main application file
├── package.json
├── .env.example
└── README.md
```

## 🚀 Deployment

The API is ready for deployment on:
- Render
- Railway
- AWS
- Heroku
- DigitalOcean

### Environment Configuration

Make sure to set all environment variables in your deployment platform:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

### Database Setup on Production

Run the schema.sql file on your production PostgreSQL database to create all necessary tables and indexes.

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:5000/health
```

## 📝 Default Admin Account

After running the schema, default accounts are created with these credentials:

### Admin Account
- Email: `admin@vnrvjiet.ac.in`
- Password: `Admin@123`

### Faculty Account  
- Email: `faculty@vnrvjiet.ac.in`
- Password: `Faculty@123`

### Student Account
- Email: `student@vnrvjiet.ac.in`
- Password: `Student@123`

**Important**: Change these passwords immediately after first login in production!

For complete API documentation with all endpoints and examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🤝 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC
