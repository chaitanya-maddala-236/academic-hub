-- Create database (run this separately)
-- CREATE DATABASE research_portal_db;

-- Connect to the database
-- \c research_portal_db;

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS patents CASCADE;
DROP TABLE IF EXISTS ip_assets CASCADE;
DROP TABLE IF EXISTS funded_projects CASCADE;
DROP TABLE IF EXISTS research_labs CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'public')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Funded Projects table
CREATE TABLE funded_projects (
    id SERIAL PRIMARY KEY,
    title TEXT,
    principal_investigator VARCHAR(100),
    department VARCHAR(100),
    funding_agency VARCHAR(100),
    sanctioned_amount NUMERIC,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_publications_faculty ON publications(faculty_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_patents_faculty ON patents(faculty_id);
CREATE INDEX idx_patents_status ON patents(status);
CREATE INDEX idx_patents_filing_date ON patents(filing_date);
CREATE INDEX idx_projects_status ON funded_projects(status);
CREATE INDEX idx_projects_department ON funded_projects(department);
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_labs_department ON research_labs(department);

-- Insert a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password, role) VALUES 
('admin@university.edu', '$2b$10$gIMLW.4dH1f41VRIzUYwiePTXi8InLDhqCySWLx9doNGhu9XDvGqu', 'admin');
