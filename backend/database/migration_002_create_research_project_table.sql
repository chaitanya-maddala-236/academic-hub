-- Migration 002: Create researchProject table for the v1 Projects CRUD API
--
-- This table is the backing store for /api/v1/projects endpoints and the
-- Prisma `researchProject` model in backend/prisma/schema.prisma.

CREATE TABLE IF NOT EXISTS "researchProject" (
  id                        SERIAL         PRIMARY KEY,
  title                     VARCHAR(512)   NOT NULL,
  abstract                  TEXT,
  department                VARCHAR(200),
  "fundingAgency"           VARCHAR(200),
  "agencyScientist"         VARCHAR(200),
  "fileNumber"              VARCHAR(100),
  "sanctionedAmount"        DOUBLE PRECISION,
  "startDate"               TIMESTAMPTZ,
  "endDate"                 TIMESTAMPTZ,
  "principalInvestigator"   VARCHAR(200),
  "coPrincipalInvestigator" VARCHAR(200),
  "teamMembers"             JSONB,
  deliverables              TEXT,
  outcomes                  TEXT,
  attachments               JSONB,
  status                    VARCHAR(50),
  duration                  VARCHAR(100),
  "createdAt"               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"               TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index for common filter columns
CREATE INDEX IF NOT EXISTS idx_research_project_department    ON "researchProject" (department);
CREATE INDEX IF NOT EXISTS idx_research_project_status        ON "researchProject" (status);
CREATE INDEX IF NOT EXISTS idx_research_project_funding_agency ON "researchProject" ("fundingAgency");
CREATE INDEX IF NOT EXISTS idx_research_project_start_date    ON "researchProject" ("startDate");
CREATE INDEX IF NOT EXISTS idx_research_project_pi            ON "researchProject" ("principalInvestigator");
