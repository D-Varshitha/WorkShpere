-- Run once in Supabase SQL Editor if "Users" has no leave-balance columns yet.
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "totalLeaves" integer NOT NULL DEFAULT 24;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "usedLeaves" integer NOT NULL DEFAULT 0;
