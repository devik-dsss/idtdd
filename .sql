-- ============================================
-- MIGRATION SCRIPT - Run this in Supabase SQL Editor
-- This simplifies the menu to be the same for all days
-- ============================================

-- Step 1: Add meal_type, start_time, end_time columns to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS meal_type text,
ADD COLUMN IF NOT EXISTS start_time time without time zone,
ADD COLUMN IF NOT EXISTS end_time time without time zone;

-- Step 2: If you have existing data in daily_menu, migrate it to menu_items
-- This copies the meal_type from daily_menu to menu_items
UPDATE public.menu_items mi
SET
  meal_type = dm.meal_type,
  start_time = dm.start_time,
  end_time = dm.end_time
FROM public.daily_menu dm
WHERE mi.id = dm.menu_item_id
AND mi.meal_type IS NULL;

-- Step 3: Remove daily_menu_id foreign key from reviews
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_daily_menu_id_fkey;

-- Step 4: Remove daily_menu_id column from reviews
ALTER TABLE public.reviews
DROP COLUMN IF EXISTS daily_menu_id;

-- Step 5: Drop the daily_menu table (no longer needed)
DROP TABLE IF EXISTS public.daily_menu;

-- Step 6: Add check constraint to ensure meal_type is valid (optional)
-- Only run if you want to enforce valid meal types
-- ALTER TABLE public.menu_items
-- ADD CONSTRAINT menu_items_meal_type_check
-- CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks'));


-- ============================================
-- REFERENCE: Final Schema (for documentation)
-- ============================================
--
-- menu_items table:
--   id, name, description, image_url, is_veg, meal_type, start_time, end_time, created_at
--
-- profiles table:
--   id, full_name, username, email, usn, branch, section, phone_number,
--   hostel_location, room_number, bio, avatar_url, is_verified, is_admin, created_at, updated_at
--
-- reviews table:
--   id, user_id, menu_item_id, rating, comment, photo_url, issue_type, created_at, updated_at
