-- ===================================================== 
-- FIX RLS POLICIES FOR ALL TABLES
-- ===================================================== 
-- This script adds missing RLS policies that are needed for triggers and normal operations

-- =====================================================
-- HABIT STREAKS POLICIES
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own streaks" ON public.habit_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.habit_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.habit_streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON public.habit_streaks;
DROP POLICY IF EXISTS "Enable insert for triggers" ON public.habit_streaks;
DROP POLICY IF EXISTS "Enable update for triggers" ON public.habit_streaks;

-- Create comprehensive policies
CREATE POLICY "Users can view own streaks" 
    ON public.habit_streaks 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" 
    ON public.habit_streaks 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" 
    ON public.habit_streaks 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" 
    ON public.habit_streaks 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Special policy for triggers (they run as SECURITY DEFINER)
CREATE POLICY "Enable insert for triggers" 
    ON public.habit_streaks 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable update for triggers" 
    ON public.habit_streaks 
    FOR UPDATE 
    USING (true);

-- =====================================================
-- USER ACHIEVEMENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Enable insert for triggers" ON public.user_achievements;

CREATE POLICY "Users can view own achievements" 
    ON public.user_achievements 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" 
    ON public.user_achievements 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable insert for triggers" 
    ON public.user_achievements 
    FOR INSERT 
    WITH CHECK (true);

-- =====================================================
-- USER CHALLENGES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON public.user_challenges;

CREATE POLICY "Users can view own challenges" 
    ON public.user_challenges 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" 
    ON public.user_challenges 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" 
    ON public.user_challenges 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges" 
    ON public.user_challenges 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- ACCOUNTABILITY PARTNERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own partnerships" ON public.accountability_partners;
DROP POLICY IF EXISTS "Users can view partnerships where they are partner" ON public.accountability_partners;
DROP POLICY IF EXISTS "Users can insert own partnerships" ON public.accountability_partners;
DROP POLICY IF EXISTS "Users can update own partnerships" ON public.accountability_partners;
DROP POLICY IF EXISTS "Users can delete own partnerships" ON public.accountability_partners;

CREATE POLICY "Users can view own partnerships" 
    ON public.accountability_partners 
    FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert own partnerships" 
    ON public.accountability_partners 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partnerships" 
    ON public.accountability_partners 
    FOR UPDATE 
    USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can delete own partnerships" 
    ON public.accountability_partners 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for system" ON public.notifications;

CREATE POLICY "Users can view own notifications" 
    ON public.notifications 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
    ON public.notifications 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
    ON public.notifications 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "Enable insert for system" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);

-- =====================================================
-- ANALYTICS SNAPSHOTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Enable insert for system" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Enable update for system" ON public.analytics_snapshots;

CREATE POLICY "Users can view own analytics" 
    ON public.analytics_snapshots 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" 
    ON public.analytics_snapshots 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" 
    ON public.analytics_snapshots 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow system to insert/update analytics
CREATE POLICY "Enable insert for system" 
    ON public.analytics_snapshots 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable update for system" 
    ON public.analytics_snapshots 
    FOR UPDATE 
    USING (true);

-- =====================================================
-- ACHIEVEMENTS (READ-ONLY FOR ALL)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;

CREATE POLICY "Anyone can view achievements" 
    ON public.achievements 
    FOR SELECT 
    USING (true);

-- =====================================================
-- CHALLENGES (READ-ONLY FOR ALL)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;

CREATE POLICY "Anyone can view active challenges" 
    ON public.challenges 
    FOR SELECT 
    USING (true);

-- =====================================================
-- HABIT TEMPLATES (READ-ONLY FOR ALL)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view templates" ON public.habit_templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.habit_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.habit_templates;

CREATE POLICY "Anyone can view templates" 
    ON public.habit_templates 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create templates" 
    ON public.habit_templates 
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update own templates" 
    ON public.habit_templates 
    FOR UPDATE 
    USING (auth.uid() = created_by);

