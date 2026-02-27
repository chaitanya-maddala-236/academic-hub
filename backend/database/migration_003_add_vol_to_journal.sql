-- Migration 003: Add Vol_Issue_Pg_ISBN column to journal table
--
-- The journal table was originally created without the
-- "Vol. no. , Issue no., Pg. no.,ISBN/ISSN Number" column in some deployments.
-- This migration adds it if it does not already exist, matching the columns
-- already present in the conference and bookchapter tables.

ALTER TABLE journal
  ADD COLUMN IF NOT EXISTS "Vol. no. , Issue no., Pg. no.,ISBN/ISSN Number" VARCHAR(512);
