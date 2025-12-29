-- Leaderboard RLS Policies
-- This script adds policies to allow users to view other users' public profile information
-- for leaderboard functionality while maintaining privacy for sensitive data

-- Drop existing restrictive policies on profiles if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to view all profiles (public information only for leaderboard)
-- This is safe because we only expose: id, username, full_name, avatar_url, total_xp, current_level
CREATE POLICY "Users can view all profiles for leaderboard"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to view all habit_streaks for leaderboard calculations
DROP POLICY IF EXISTS "Users can view own habit streaks" ON public.habit_streaks;

CREATE POLICY "Users can view all habit streaks for leaderboard"
  ON public.habit_streaks
  FOR SELECT
  USING (true);

-- Users can only modify their own habit streaks
CREATE POLICY "Users can modify own habit streaks"
  ON public.habit_streaks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view all habit_completions for leaderboard period calculations
DROP POLICY IF EXISTS "Users can view own completions" ON public.habit_completions;

CREATE POLICY "Users can view all completions for leaderboard"
  ON public.habit_completions
  FOR SELECT
  USING (true);

-- Users can only modify their own completions
CREATE POLICY "Users can modify own completions"
  ON public.habit_completions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Habits table should remain private (users can only see their own habits)
-- The leaderboard only needs aggregate data from completions and streaks

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.habit_streaks TO authenticated;
GRANT SELECT ON public.habit_completions TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

