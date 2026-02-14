

# AcademicArchives – Implementation Plan

## Overview
A centralized academic research platform for storing, managing, and showcasing institutional projects, publications, and faculty profiles. Clean academic theme with white + blue primary colors, sidebar navigation, and card-based layouts matching your wireframe design.

## Backend (Lovable Cloud / Supabase)
- **Authentication** with role-based access (Admin, Faculty, Student, Viewer)
- **Database** for projects, publications, faculty, departments, and users
- **File Storage** for PDF uploads (project reports, publication documents)
- **Row-Level Security** so users only edit their own submissions; admins manage everything

---

## Pages & Features

### 🏠 Public Pages (No Login Required)

**1. Home / Dashboard (`/`)**
- Global search bar across projects, publications, and faculty
- Quick access cards (Projects, Publications, Faculty)
- Stats overview (total projects, publications, departments)
- Recent additions section

**2. Projects List (`/projects`)**
- Filterable table: Department, Year, Guide, Domain
- Search within projects
- Click any row to view details

**3. Project Detail (`/projects/:id`)**
- Title, abstract, department, year, guide, team members
- Download PDF report, GitHub link, demo link

**4. Publications List (`/publications`)**
- Filterable table: Faculty, Year, Journal/Conference, Keywords
- Search within publications

**5. Publication Detail (`/publications/:id`)**
- Title, faculty, journal, year, DOI, abstract
- Download PDF, Google Scholar link

**6. Faculty Directory (`/faculty`)**
- Searchable list with department and expertise filters
- Card-based layout with photo, name, department

**7. Faculty Profile (`/faculty/:id`)**
- Profile details: photo, name, department, expertise, research interests
- List of publications and supervised projects (auto-populated from data)

### 🔐 Authentication Pages

**8. Login (`/login`)** – Email/password login with role-based redirect
**9. Register (`/register`)** – Optional self-registration

### 🎓 Student Dashboard (Protected)

**10. Student Dashboard (`/student-dashboard`)**
- View own submissions and their approval status
- Submit new project form (title, abstract, year, department, PDF, GitHub link, guide)

### 👩‍🏫 Faculty Dashboard (Protected)

**11. Faculty Dashboard (`/faculty-dashboard`)**
- View own submissions (projects + publications)
- Submit new project or publication
- Edit submissions before approval

### 🛡️ Admin Pages (Protected – Admin Only)

**12. Admin Dashboard (`/admin`)**
- Pending approvals count, upload stats, department contributions
- Quick action buttons

**13. Manage Projects (`/admin/projects`)**
- Tabs: Pending / Approved / Rejected
- Approve, reject, edit metadata, delete

**14. Manage Publications (`/admin/publications`)**
- Same tab structure as projects management

**15. Manage Faculty (`/admin/faculty`)**
- Add, edit, delete faculty profiles

**16. Manage Users (`/admin/users`)**
- Manage roles, activate/deactivate accounts

**17. Bulk Upload (`/admin/bulk-upload`)**
- CSV/Excel upload with format validation, preview, and confirm import

---

## Design & Layout
- **Sidebar navigation**: Dashboard, Projects, Publications, Faculty, Admin (conditional)
- **Top bar**: Global search + profile dropdown
- **Theme**: White background, blue (#1565C0) primary, clean professional academic look
- **Responsive**: Mobile-friendly with collapsible sidebar
- **Components**: Data tables with sorting/pagination, card-based stats, form dialogs

