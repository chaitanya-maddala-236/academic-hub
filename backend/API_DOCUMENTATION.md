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
  "role": "student"
}
```

**Roles:** `admin`, `faculty`, `student`, `public`

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
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

### Create Project (Admin Only)
```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
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

### Delete Project (Admin Only)
```http
DELETE /api/projects/:id
Authorization: Bearer <admin_token>
```

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

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
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
