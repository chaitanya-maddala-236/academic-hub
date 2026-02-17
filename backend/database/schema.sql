-- Create database (run this separately)
-- CREATE DATABASE research_portal_db;

-- Connect to the database
-- \c research_portal_db;

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS teaching_materials CASCADE;
DROP TABLE IF EXISTS student_projects CASCADE;
DROP TABLE IF EXISTS awards CASCADE;
DROP TABLE IF EXISTS consultancy CASCADE;
DROP TABLE IF EXISTS ipr CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS patents CASCADE;
DROP TABLE IF EXISTS ip_assets CASCADE;
DROP TABLE IF EXISTS funded_projects CASCADE;
DROP TABLE IF EXISTS research_labs CASCADE;
DROP TABLE IF EXISTS research_centers CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student', 'public')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    specialization TEXT,
    bio TEXT,
    email VARCHAR(100) UNIQUE,
    profile_image TEXT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Publications table
CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    journal_name TEXT,
    publication_type VARCHAR(20) CHECK (publication_type IN ('journal', 'conference')),
    year INT,
    indexing VARCHAR(50),
    national_international VARCHAR(20) CHECK (national_international IN ('national', 'international')),
    faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100),
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Patents table
CREATE TABLE patents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    patent_number VARCHAR(100),
    inventors TEXT,
    department VARCHAR(100),
    status VARCHAR(50),
    filing_date DATE,
    grant_date DATE,
    description TEXT,
    faculty_id INT REFERENCES faculty(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IP Assets table
CREATE TABLE ip_assets (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type VARCHAR(50) CHECK (type IN ('patent', 'copyright', 'trademark', 'design')),
    owner VARCHAR(100),
    department VARCHAR(100),
    filing_year INT,
    expiry_date DATE,
    status VARCHAR(50),
    commercialized BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Funded Projects table (Research Projects)
CREATE TABLE funded_projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    agency VARCHAR(200),
    agency_scientist VARCHAR(100),
    file_number VARCHAR(100),
    amount_sanctioned NUMERIC,
    funds_per_year JSONB,
    start_date DATE,
    end_date DATE,
    pi VARCHAR(100),
    copi VARCHAR(200),
    objectives TEXT,
    deliverables TEXT,
    outcomes TEXT,
    team TEXT,
    department VARCHAR(100),
    status VARCHAR(50),
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Research Labs table
CREATE TABLE research_labs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    department VARCHAR(100),
    head VARCHAR(100),
    description TEXT,
    focus_areas TEXT[],
    established_year INT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Research Centers table
CREATE TABLE research_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    head VARCHAR(100),
    department VARCHAR(100),
    established_year INT,
    focus_areas TEXT[],
    facilities TEXT,
    image_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- IPR (Patents, Trademarks, Copyrights) table
CREATE TABLE ipr (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    ipr_type VARCHAR(20) CHECK (ipr_type IN ('patent', 'trademark', 'copyright')),
    application_number VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('filed', 'published', 'granted', 'rejected')),
    filing_date DATE,
    publication_date DATE,
    grant_date DATE,
    inventors TEXT,
    faculty_id INT REFERENCES faculty(id),
    department VARCHAR(100),
    description TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Consultancy table
CREATE TABLE consultancy (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    client VARCHAR(200),
    faculty_id INT REFERENCES faculty(id),
    department VARCHAR(100),
    amount_earned NUMERIC,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Student Projects table (UG/PG)
CREATE TABLE student_projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    project_type VARCHAR(20) CHECK (project_type IN ('UG', 'PG')),
    students TEXT,
    guide_id INT REFERENCES faculty(id),
    department VARCHAR(100),
    year INT,
    abstract TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Teaching Materials table
CREATE TABLE teaching_materials (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    material_type VARCHAR(20) CHECK (material_type IN ('ppt', 'pdf', 'video')),
    file_url TEXT,
    video_link TEXT,
    faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
    course_name VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Awards table
CREATE TABLE awards (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('faculty', 'student', 'department')),
    recipient_name VARCHAR(100),
    faculty_id INT REFERENCES faculty(id),
    award_type VARCHAR(100),
    awarding_body VARCHAR(200),
    year INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_publications_faculty ON publications(faculty_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_publications_department ON publications(department);
CREATE INDEX idx_patents_faculty ON patents(faculty_id);
CREATE INDEX idx_patents_status ON patents(status);
CREATE INDEX idx_patents_filing_date ON patents(filing_date);
CREATE INDEX idx_projects_status ON funded_projects(status);
CREATE INDEX idx_projects_department ON funded_projects(department);
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_labs_department ON research_labs(department);
CREATE INDEX idx_research_centers_department ON research_centers(department);
CREATE INDEX idx_ipr_faculty ON ipr(faculty_id);
CREATE INDEX idx_ipr_status ON ipr(status);
CREATE INDEX idx_ipr_type ON ipr(ipr_type);
CREATE INDEX idx_consultancy_faculty ON consultancy(faculty_id);
CREATE INDEX idx_student_projects_guide ON student_projects(guide_id);
CREATE INDEX idx_teaching_materials_faculty ON teaching_materials(faculty_id);
CREATE INDEX idx_awards_faculty ON awards(faculty_id);

-- Insert default users (passwords are hashed with bcrypt)
-- Admin: admin@vnrvjiet.ac.in / Admin@123
-- Faculty: faculty@vnrvjiet.ac.in / Faculty@123
-- Student: student@vnrvjiet.ac.in / Student@123
INSERT INTO users (email, password, role) VALUES 
('admin@vnrvjiet.ac.in', '$2b$10$SbP8kf2bVApGMEUUWqfJF.q8yyJQd4FqjKx/b02dCxbhvYq0D8CRm', 'admin'),
('faculty@vnrvjiet.ac.in', '$2b$10$F9MIr73/gtl7hb05icHrJuoXkjKfYXUoJ//0fZVE/YM4vNHTFsOpy', 'faculty'),
('student@vnrvjiet.ac.in', '$2b$10$s8o16BSvSqlNm9om8R.JCOYdFCCMUHRG4mWQ4Je6bFFGm7YCjM4wC', 'student'),
('admin@university.edu', '$2b$10$gIMLW.4dH1f41VRIzUYwiePTXi8InLDhqCySWLx9doNGhu9XDvGqu', 'admin');
