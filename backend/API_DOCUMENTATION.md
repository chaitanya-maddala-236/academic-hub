# Academic Research Management System - Complete API Documentation

A comprehensive REST API backend for managing university research data including publications, patents, IPR, funded projects, research centers, consultancy, teaching materials, awards, student projects, and faculty information.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
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

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE research_portal_db;"

# Run schema
psql -U postgres -d research_portal_db -f database/schema.sql
```

### Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

# Academic Hub API Documentation

Complete API reference for the University Research Management System.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Default Users

The system comes with three default users:

| Email | Password | Role |
|-------|----------|------|
| admin@vnrvjiet.ac.in | Admin@123 | admin |
| faculty@vnrvjiet.ac.in | Faculty@123 | faculty |
| student@vnrvjiet.ac.in | Student@123 | student |

## 👥 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD on all resources |
| **faculty** | Read all, Create/Update own resources |
| **student** | Read-only access, limited submissions |
| **public** | Read-only public data |

## 📚 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### Register User
### Dummy Login Credentials

For testing purposes, use these credentials:

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@vnrvjiet.ac.in         | Admin@123    |
| Faculty | faculty@vnrvjiet.ac.in       | Faculty@123  |
| Student | student@vnrvjiet.ac.in       | Student@123  |

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@vnrvjiet.ac.in",
  "password": "password123",
  "role": "student"  // admin | faculty | student | public
}
```

#### Login
  "role": "student"
}
```

**Roles:** `admin`, `faculty`, `student`, `public`

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@vnrvjiet.ac.in",
  "password": "password123"
}

Response:
  "email": "admin@vnrvjiet.ac.in",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@vnrvjiet.ac.in",
      "role": "student"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@vnrvjiet.ac.in",
    "role": "student",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

---

### Faculty Endpoints

#### List Faculty
```http
GET /api/faculty?department=CSE&page=1&limit=10

Query Parameters:
- department (optional): Filter by department
- search (optional): Search by name or email
- sortByPublications (optional): Sort by publication count
- page (default: 1): Page number
- limit (default: 10): Results per page
```

#### Get Faculty by ID
```http
GET /api/faculty/:id

Returns faculty with related publications, patents, and projects
```

#### Create Faculty (Admin only)
```http
POST /api/faculty
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Dr. John Doe",
  "designation": "Professor",
  "department": "Computer Science",
  "specialization": "Machine Learning, AI",
  "bio": "Brief biography",
  "email": "john.doe@vnrvjiet.ac.in",
  "profile_image": <file>
}
```

#### Update Faculty
```http
PUT /api/faculty/:id
Authorization: Bearer <token>
```

#### Delete Faculty (Admin only)
```http
DELETE /api/faculty/:id
Authorization: Bearer <admin_token>
```

---

### Research Projects (Funded Projects)

#### List Projects
```http
GET /api/projects?status=ongoing&department=CSE&year=2024

Query Parameters:
- status: ongoing | completed | upcoming
- department: Filter by department
- funding_agency: Filter by funding agency
- year: Filter by start year
- page, limit: Pagination
```

#### Get Project by ID
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@vnrvjiet.ac.in",
      "role": "admin"
    }
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Research Centers

### List All Research Centers
```http
GET /api/research-centers?department=Computer Science&page=1&limit=10
```

**Query Parameters:**
- `department` (optional) - Filter by department
- `research_area` (optional) - Filter by research area
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

### Get Research Center by ID
```http
GET /api/research-centers/:id
```

### Create Research Center (Admin Only)
```http
POST /api/research-centers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "AI & ML Research Center",
  "description": "Advanced research in AI and ML",
  "head": "Dr. Rajesh Kumar",
  "department": "Computer Science",
  "established_year": 2020,
  "focus_areas": ["Machine Learning", "Deep Learning"],
  "facilities": "High-performance computing lab",
  "website_url": "https://example.com"
}
```

### Update Research Center (Admin Only)
```http
PUT /api/research-centers/:id
Authorization: Bearer <admin_token>
```

### Delete Research Center (Admin Only)
```http
DELETE /api/research-centers/:id
Authorization: Bearer <admin_token>
```

## Research Projects (Funded Projects)

### List All Projects
```http
GET /api/projects?status=ongoing&department=Computer Science&year=2024&page=1&limit=10
```

**Query Parameters:**
- `status` (optional) - Filter by status: `ongoing`, `completed`, `upcoming`
- `department` (optional) - Filter by department
- `agency` (optional) - Filter by funding agency
- `year` (optional) - Filter by start year
- `page`, `limit` - Pagination

### Get Project by ID
```http
GET /api/projects/:id
```

#### Create Project (Admin only)
### Create Project (Admin Only)
```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "AI Research Project",
  "principal_investigator": "Dr. John Doe",
  "co_principal_investigator": "Dr. Jane Smith",
  "department": "Computer Science",
  "funding_agency": "DST",
  "agency_scientist": "Dr. Agency Scientist",
  "file_number": "DST/2024/001",
  "sanctioned_amount": 5000000,
  "funds_per_year": {
    "2024": 1500000,
    "2025": 2000000,
    "2026": 1500000
  },
  "start_date": "2024-01-01",
  "end_date": "2026-12-31",
  "objectives": "Research objectives",
  "deliverables": "Expected deliverables",
  "outcomes": "Expected outcomes",
  "team": "Team members list",
  "pdf_url": "/uploads/projects/proposal.pdf"
}
```

#### Update Project (Admin only)
  "title": "AI-Powered Healthcare System",
  "agency": "ICMR",
  "agency_scientist": "Dr. M. Srinivas",
  "file_number": "ICMR/2023/AI-001",
  "amount_sanctioned": 3500000,
  "funds_per_year": {"2023": 1000000, "2024": 1500000, "2025": 1000000},
  "start_date": "2023-06-01",
  "end_date": "2025-05-31",
  "pi": "Dr. Rajesh Kumar",
  "copi": "Dr. Priya Sharma",
  "objectives": "Development of AI algorithms for early disease detection",
  "deliverables": "Working prototype and research papers",
  "outcomes": "Improved diagnostic accuracy",
  "team": "5 research scholars, 3 faculty",
  "department": "Computer Science"
}
```

### Update Project (Admin Only)
```http
PUT /api/projects/:id
Authorization: Bearer <admin_token>
```

#### Delete Project (Admin only)
### Delete Project (Admin Only)
```http
DELETE /api/projects/:id
Authorization: Bearer <admin_token>
```

---

### Publications

#### List Publications
```http
GET /api/publications?year=2024&type=journal&department=CSE

Query Parameters:
- year: Filter by publication year
- publication_type: journal | conference
- department: Filter by department
- indexing: Scopus | Web of Science | etc.
- search: Search in title
- faculty_id: Filter by faculty
- page, limit: Pagination
```

#### Get Publication by ID
```http
GET /api/publications/:id
```

#### Create Publication (Admin only)
```http
POST /api/publications
## IPR (Intellectual Property Rights)

### List All IPR
```http
GET /api/ipr?type=patent&status=granted&department=Computer Science&year=2024
```

**Query Parameters:**
- `type` (optional) - Filter by type: `patent`, `trademark`, `copyright`
- `status` (optional) - Filter by status: `filed`, `published`, `granted`, `rejected`
- `department` (optional)
- `year` (optional) - Filing year

### Get IPR by ID
```http
GET /api/ipr/:id
```

### Create IPR (Admin Only)
```http
POST /api/ipr
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Paper Title",
  "journal_name": "IEEE Transactions",
  "publication_type": "journal",
  "year": 2024,
  "indexing": "Scopus, Web of Science",
  "national_international": "international",
  "faculty_id": 1,
  "pdf_url": "/uploads/publications/paper.pdf"
}
```

---

### IPR (Intellectual Property Rights)

Endpoints available at both `/api/ipr` and `/api/ip-assets`

#### List IPR
```http
GET /api/ipr?type=patent&status=granted

Query Parameters:
- type: patent | copyright | trademark | design
- status: filed | published | granted | rejected | expired
- department: Filter by department
- commercialized: true | false
- year: Filter by filing year
- page, limit: Pagination
```

#### Get IPR by ID
```http
GET /api/ipr/:id
```

#### Create IPR (Admin only)
```http
POST /api/ipr
  "title": "AI-Based Disease Detection System",
  "ipr_type": "patent",
  "application_number": "IN202341001234",
  "status": "filed",
  "filing_date": "2023-03-15",
  "publication_date": "2023-09-20",
  "grant_date": null,
  "inventors": "Dr. Rajesh Kumar, Dr. Priya Sharma",
  "faculty_id": 1,
  "department": "Computer Science",
  "description": "Novel AI algorithm for disease detection",
  "pdf_url": "/uploads/patents/patent-001.pdf"
}
```

### Update IPR (Admin Only)
```http
PUT /api/ipr/:id
Authorization: Bearer <admin_token>
```

### Delete IPR (Admin Only)
```http
DELETE /api/ipr/:id
Authorization: Bearer <admin_token>
```

## Consultancy

### List All Consultancy
```http
GET /api/consultancy?department=Computer Science&status=ongoing&year=2024
```

**Query Parameters:**
- `department` (optional)
- `faculty_id` (optional)
- `status` (optional)
- `year` (optional) - Start year

### Get Consultancy by ID
```http
GET /api/consultancy/:id
```

### Create Consultancy (Admin Only)
```http
POST /api/consultancy
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Novel AI Algorithm",
  "type": "patent",
  "owner": "VNRVJIET",
  "inventors": "Dr. John Doe, Dr. Jane Smith",
  "department": "Computer Science",
  "filing_year": 2024,
  "filing_date": "2024-01-15",
  "published_date": "2024-06-15",
  "granted_date": "2024-12-15",
  "status": "granted",
  "application_number": "202441000001",
  "registration_number": "IN123456",
  "description": "Detailed description",
  "pdf_url": "/uploads/ipr/patent.pdf",
  "commercialized": false,
  "faculty_id": 1
}
```

---

### Research Centers

Endpoints available at both `/api/research-centers` and `/api/labs`

#### List Research Centers
```http
GET /api/research-centers?department=CSE

Query Parameters:
- department: Filter by department
- research_area: Filter by research area
- page, limit: Pagination
```

#### Create Research Center (Admin only)
```http
POST /api/research-centers
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Center for AI Research",
  "department": "Computer Science",
  "head": "Dr. John Doe",
  "description": "Center description",
  "focus_areas": ["Machine Learning", "Deep Learning", "NLP"],
  "established_year": 2020,
  "image": <file>
}
```

---

### Consultancy

#### List Consultancy
```http
GET /api/consultancy?department=CSE&status=ongoing

Query Parameters:
- department: Filter by department
- status: ongoing | completed | cancelled
- faculty_id: Filter by faculty
- year: Filter by start year
- page, limit: Pagination
```

#### Get Consultancy by ID
```http
GET /api/consultancy/:id
```

#### Create Consultancy (Admin/Faculty)
```http
POST /api/consultancy
  "title": "AI Implementation Consulting",
  "client": "Tech Solutions Pvt Ltd",
  "faculty_id": 1,
  "department": "Computer Science",
  "amount_earned": 500000,
  "start_date": "2023-09-01",
  "end_date": "2024-02-28",
  "status": "completed",
  "description": "Consulting on AI/ML implementation"
}
```

### Update Consultancy (Admin Only)
```http
PUT /api/consultancy/:id
Authorization: Bearer <admin_token>
```

### Delete Consultancy (Admin Only)
```http
DELETE /api/consultancy/:id
Authorization: Bearer <admin_token>
```

## Publications

### List All Publications
```http
GET /api/publications?year=2024&publication_type=journal&department=Computer Science
```

**Query Parameters:**
- `year` (optional)
- `publication_type` (optional) - `journal`, `conference`
- `department` (optional)
- `indexing` (optional) - `SCI`, `Scopus`, etc.
- `faculty_id` (optional)
- `search` (optional) - Search in title

### Get Publication by ID
```http
GET /api/publications/:id
```

### Create Publication (Admin Only)
```http
POST /api/publications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Deep Learning for Medical Imaging",
  "journal_name": "IEEE Transactions on Medical Imaging",
  "publication_type": "journal",
  "year": 2024,
  "indexing": "SCI",
  "national_international": "international",
  "faculty_id": 1,
  "department": "Computer Science",
  "pdf_url": "/uploads/publications/paper-001.pdf"
}
```

### Update Publication (Admin Only)
```http
PUT /api/publications/:id
Authorization: Bearer <admin_token>
```

### Delete Publication (Admin Only)
```http
DELETE /api/publications/:id
Authorization: Bearer <admin_token>
```

## Student Projects

### List All Student Projects
```http
GET /api/student-projects?project_type=UG&department=Computer Science&year=2024
```

**Query Parameters:**
- `project_type` (optional) - `UG`, `PG`
- `department` (optional)
- `guide_id` (optional) - Faculty ID
- `year` (optional)

### Get Student Project by ID
```http
GET /api/student-projects/:id
```

### Create Student Project (Admin/Faculty)
```http
POST /api/student-projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Industrial Consultancy Project",
  "faculty_id": 1,
  "client_name": "ABC Corporation",
  "department": "Computer Science",
  "amount_earned": 500000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "description": "Project description",
  "status": "ongoing"
}
```

---

### Teaching Materials

#### List Teaching Materials
```http
GET /api/materials?faculty_id=1&department=CSE

Query Parameters:
- faculty_id: Filter by faculty
- department: Filter by department
- course_name: Filter by course
- material_type: ppt | pdf | video | document | other
- page, limit: Pagination
```

#### Create Teaching Material (Faculty/Admin)
```http
POST /api/materials
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Introduction to Machine Learning",
  "faculty_id": 1,
  "department": "Computer Science",
  "course_name": "CS501",
  "material_type": "pdf",
  "file": <file>,
  "video_link": "https://youtube.com/...",
  "description": "Course material description"
}
```

#### Delete Material (Faculty/Admin)
```http
DELETE /api/materials/:id
Authorization: Bearer <token>
```

---

### Awards & Recognitions

#### List Awards
```http
GET /api/awards?faculty_id=1&year=2024

Query Parameters:
- faculty_id: Filter by faculty
- year: Filter by year
- award_type: Filter by award type
- page, limit: Pagination
```

#### Create Award (Admin/Faculty)
```http
POST /api/awards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Best Researcher Award",
  "faculty_id": 1,
  "award_type": "National Award",
  "awarded_by": "IEEE",
  "year": 2024,
  "date_received": "2024-06-15",
  "description": "Award description",
  "certificate_url": "/uploads/awards/certificate.pdf"
}
```

---

### Student Projects (Academic Projects)

#### List Student Projects
```http
GET /api/student-projects?project_type=UG&department=CSE

Query Parameters:
- faculty_id: Filter by faculty guide
- department: Filter by department
- project_type: UG | PG | PhD
- academic_year: Filter by academic year
- page, limit: Pagination
```

#### Create Student Project (Faculty/Admin)
```http
POST /api/student-projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "IoT Based Smart Home System",
  "faculty_id": 1,
  "student_names": "Student1, Student2, Student3",
  "department": "Computer Science",
  "project_type": "UG",
  "academic_year": "2023-24",
  "abstract": "Project abstract",
  "pdf_url": "/uploads/projects/report.pdf"
}
```

---

## 📊 Response Format

All API responses follow this standard format:

### Success Response
  "title": "Blockchain-Based Voting System",
  "project_type": "UG",
  "students": "Rahul Verma, Priya Singh, Amit Kumar",
  "guide_id": 1,
  "department": "Computer Science",
  "year": 2024,
  "abstract": "A secure voting system using blockchain",
  "pdf_url": "/uploads/projects/project-001.pdf"
}
```

### Update Student Project (Admin/Faculty)
```http
PUT /api/student-projects/:id
Authorization: Bearer <token>
```

### Delete Student Project (Admin Only)
```http
DELETE /api/student-projects/:id
Authorization: Bearer <admin_token>
```

## Teaching Materials

### List All Teaching Materials (Authenticated)
```http
GET /api/materials?material_type=pdf&department=Computer Science&faculty_id=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `material_type` (optional) - `ppt`, `pdf`, `video`
- `faculty_id` (optional)
- `department` (optional)
- `course_name` (optional)

### Get Teaching Material by ID (Authenticated)
```http
GET /api/materials/:id
Authorization: Bearer <token>
```

### Create Teaching Material (Admin/Faculty)
```http
POST /api/materials
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Machine Learning",
  "description": "Comprehensive lecture notes",
  "material_type": "pdf",
  "file_url": "/uploads/materials/ml-notes.pdf",
  "video_link": null,
  "faculty_id": 1,
  "course_name": "Machine Learning",
  "department": "Computer Science"
}
```

### Update Teaching Material (Admin/Faculty)
```http
PUT /api/materials/:id
Authorization: Bearer <token>
```

### Delete Teaching Material (Admin/Faculty)
```http
DELETE /api/materials/:id
Authorization: Bearer <token>
```

## Awards

### List All Awards
```http
GET /api/awards?recipient_type=faculty&year=2024
```

**Query Parameters:**
- `recipient_type` (optional) - `faculty`, `student`, `department`
- `faculty_id` (optional)
- `year` (optional)

### Get Award by ID
```http
GET /api/awards/:id
```

### Create Award (Admin Only)
```http
POST /api/awards
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Best Research Paper Award",
  "recipient_type": "faculty",
  "recipient_name": "Dr. Rajesh Kumar",
  "faculty_id": 1,
  "award_type": "Research Excellence",
  "awarding_body": "IEEE",
  "year": 2024,
  "description": "Best paper at IEEE Conference"
}
```

### Update Award (Admin Only)
```http
PUT /api/awards/:id
Authorization: Bearer <admin_token>
```

### Delete Award (Admin Only)
```http
DELETE /api/awards/:id
Authorization: Bearer <admin_token>
```

## Dashboard Analytics (Admin Only)

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProjects": 25,
      "totalFunding": 45000000,
      "totalPublications": 150,
      "totalIPR": 30,
      "totalConsultancyRevenue": 5000000
    },
    "publicationsPerYear": [...],
    "iprGrowth": [...],
    "departmentStats": [...]
  }
}
```

### Get Publications Per Year
```http
GET /api/dashboard/publications-per-year?years=5
Authorization: Bearer <admin_token>
```

### Get Patent Growth
```http
GET /api/dashboard/patent-growth?years=5
Authorization: Bearer <admin_token>
```

### Get Consultancy Revenue
```http
GET /api/dashboard/consultancy-revenue?years=5
Authorization: Bearer <admin_token>
```

### Get Department Comparison
```http
GET /api/dashboard/department-comparison
Authorization: Bearer <admin_token>
```

## Standard Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Parameterized SQL queries (SQL injection prevention)
- Input validation with express-validator
- CORS configuration
- Environment variable protection
- Global error handling

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                          # Database configuration
├── controllers/
│   ├── auth.controller.js             # Authentication logic
│   ├── faculty.controller.js          # Faculty operations
│   ├── publications.controller.js     # Publications CRUD
│   ├── patents.controller.js          # Patents CRUD
│   ├── ipAssets.controller.js         # IPR CRUD
│   ├── projects.controller.js         # Funded projects CRUD
│   ├── labs.controller.js             # Research centers CRUD
│   ├── consultancy.controller.js      # Consultancy CRUD
│   ├── materials.controller.js        # Teaching materials CRUD
│   ├── awards.controller.js           # Awards CRUD
│   └── studentProjects.controller.js  # Student projects CRUD
├── routes/
│   ├── auth.routes.js                 # Auth routes
│   ├── faculty.routes.js              # Faculty routes
│   ├── publications.routes.js         # Publications routes
│   ├── patents.routes.js              # Patents routes
│   ├── ipAssets.routes.js             # IPR routes
│   ├── projects.routes.js             # Projects routes
│   ├── labs.routes.js                 # Research centers routes
│   ├── consultancy.routes.js          # Consultancy routes
│   ├── materials.routes.js            # Teaching materials routes
│   ├── awards.routes.js               # Awards routes
│   └── studentProjects.routes.js      # Student projects routes
├── middleware/
│   ├── auth.middleware.js             # JWT verification
│   ├── role.middleware.js             # Role-based access
│   └── error.middleware.js            # Global error handler
├── database/
│   └── schema.sql                     # Database schema
├── uploads/                           # File upload directory
│   └── materials/                     # Teaching materials uploads
├── server.js                          # Main application file
├── package.json
├── .env.example
└── README.md
```

## 🗄️ Database Tables

- `users` - User authentication and roles
- `faculty` - Faculty profiles and information
- `publications` - Research publications
- `patents` - Patent records (legacy, use ip_assets)
- `ip_assets` - Comprehensive IPR management
- `funded_projects` - Research projects with funding
- `research_labs` - Research centers/labs
- `consultancy` - Consultancy projects
- `teaching_materials` - Course materials
- `awards` - Awards and recognitions
- `student_projects` - UG/PG/PhD student projects

## 🚀 Deployment

Ready for deployment on:
- Render
- Railway
- AWS
- Heroku
- DigitalOcean

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production database
- [ ] Set proper CORS_ORIGIN
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure file storage (S3/local)
- [ ] Set up monitoring and logging

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC
  "errors": []
}
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Role-Based Access Control

| Endpoint | Admin | Faculty | Student | Public |
|----------|-------|---------|---------|--------|
| Auth (login/register) | ✓ | ✓ | ✓ | ✓ |
| Research Centers (read) | ✓ | ✓ | ✓ | ✓ |
| Research Centers (write) | ✓ | ✗ | ✗ | ✗ |
| Projects (read) | ✓ | ✓ | ✓ | ✓ |
| Projects (write) | ✓ | ✗ | ✗ | ✗ |
| IPR (read) | ✓ | ✓ | ✓ | ✓ |
| IPR (write) | ✓ | ✗ | ✗ | ✗ |
| Consultancy (read) | ✓ | ✓ | ✓ | ✓ |
| Consultancy (write) | ✓ | ✗ | ✗ | ✗ |
| Publications (read) | ✓ | ✓ | ✓ | ✓ |
| Publications (write) | ✓ | ✗ | ✗ | ✗ |
| Student Projects (read) | ✓ | ✓ | ✓ | ✓ |
| Student Projects (write) | ✓ | ✓ | ✗ | ✗ |
| Teaching Materials (read) | ✓ | ✓ | ✓ | ✗ |
| Teaching Materials (write) | ✓ | ✓ | ✗ | ✗ |
| Awards (read) | ✓ | ✓ | ✓ | ✓ |
| Awards (write) | ✓ | ✗ | ✗ | ✗ |
| Dashboard | ✓ | ✗ | ✗ | ✗ |

## File Upload

Endpoints that support file uploads use `multipart/form-data`:

```http
POST /api/faculty
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Dr. John Doe",
  "email": "john.doe@vnrvjiet.ac.in",
  "department": "Computer Science",
  "profile_image": <file>
}
```

Uploaded files are stored in `/uploads` directory and accessible via:
```
http://localhost:5000/uploads/<filename>
```
