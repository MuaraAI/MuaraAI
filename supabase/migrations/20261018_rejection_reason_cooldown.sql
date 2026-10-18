-- Add rejection_reason column to public.members to track maintainer feedback on rejected submissions
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS rejection_reason text;
