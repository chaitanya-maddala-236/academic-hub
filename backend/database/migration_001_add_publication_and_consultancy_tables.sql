-- Migration 001: Add missing columns/tables required by Prisma schema and controllers
--
-- Problems fixed:
-- 1. journal.Faculty_name column missing  -> ALTER TABLE journal ADD COLUMN IF NOT EXISTS
-- 2. conference table missing             -> CREATE TABLE IF NOT EXISTS conference
-- 3. bookchapter table missing            -> CREATE TABLE IF NOT EXISTS bookchapter
-- 4. ongoing_consultancy table missing    -> CREATE TABLE IF NOT EXISTS ongoing_consultancy

-- 1. Add Faculty_name column to journal table if it doesn't already exist
ALTER TABLE journal
  ADD COLUMN IF NOT EXISTS "Faculty_name" VARCHAR(512);

-- 2. Create conference table (mirrors the Prisma `conference` model)
CREATE TABLE IF NOT EXISTS conference (
  "S.No."                                              INTEGER      PRIMARY KEY,
  "Faculty_name"                                       VARCHAR(512),
  "Name of author/s"                                   VARCHAR(512),
  "Title of the paper"                                 VARCHAR(512),
  "Name of the Conference"                             VARCHAR(512),
  "National/ International"                            VARCHAR(512),
  "Date of Publication (DDMMYYYY)"                     VARCHAR(512),
  "Vol. no. , Issue no., Pg. no.,ISBN/ISSN Number"     VARCHAR(512),
  "Indexing"                                           VARCHAR(512),
  "Name of the publisher"                              VARCHAR(512),
  "DOI of paper"                                       VARCHAR(512)
);

-- 3. Create bookchapter table (mirrors the Prisma `bookchapter` model)
CREATE TABLE IF NOT EXISTS bookchapter (
  "S.No."                                              INTEGER      PRIMARY KEY,
  "Faculty_name"                                       VARCHAR(512),
  "Journal/ Conference/Book Chapter"                   VARCHAR(512),
  "Name of author/s"                                   VARCHAR(512),
  "Title of the paper"                                 VARCHAR(512),
  "Name of the Journal/ Conference"                    VARCHAR(512),
  "National/ International"                            VARCHAR(512),
  "Date of Publication (DDMMYYYY)"                     VARCHAR(512),
  "Vol. no. , Issue no., Pg. no.,ISBN/ISSN Number"     VARCHAR(512),
  "Indexing"                                           VARCHAR(512),
  "Name of the publisher"                              VARCHAR(512),
  "DOI of paper"                                       VARCHAR(512)
);

-- 4. Create ongoing_consultancy table (used by backend/controllers/consultancy.controller.js)
CREATE TABLE IF NOT EXISTS ongoing_consultancy (
  id                      SERIAL       PRIMARY KEY,
  project_title           VARCHAR(512),
  principal_investigator  VARCHAR(512),
  co_investigators        TEXT,
  department              VARCHAR(200),
  institute_level         VARCHAR(200),
  estimated_amount_lakhs  NUMERIC(12, 2),
  received_amount_lakhs   NUMERIC(12, 2),
  remarks                 TEXT,
  status                  VARCHAR(50)  DEFAULT 'active',
  created_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ongoing_consultancy
CREATE INDEX IF NOT EXISTS idx_ongoing_consultancy_status     ON ongoing_consultancy (status);
CREATE INDEX IF NOT EXISTS idx_ongoing_consultancy_department ON ongoing_consultancy (department);
