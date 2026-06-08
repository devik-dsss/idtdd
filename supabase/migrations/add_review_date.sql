-- Migration: Add review_date column for daily review functionality
-- Description: Allows users to review the same menu item multiple times, but only once per day

-- Add review_date column to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS review_date DATE DEFAULT CURRENT_DATE;

-- Update existing reviews to set review_date from created_at
UPDATE reviews
SET review_date = DATE(created_at)
WHERE review_date IS NULL;

-- Make review_date NOT NULL after populating existing data
ALTER TABLE reviews
ALTER COLUMN review_date SET NOT NULL;

-- Drop existing unique constraint if any (on user_id + menu_item_id)
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_user_menu_unique;

-- Add new unique constraint: one review per user per menu item per day
ALTER TABLE reviews
ADD CONSTRAINT reviews_user_menu_date_unique
UNIQUE (user_id, menu_item_id, review_date);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_user_menu_date
ON reviews (user_id, menu_item_id, review_date);
