-- BPMN Editor schema extension for hjordis_gostas project
-- Run this in your Supabase SQL Editor
-- This adds BPMN editor functionality without affecting existing tables

-- =============================================
-- HELPER FUNCTION (create if not exists)
-- =============================================

-- Create set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- BPMN EDITOR USER PROFILES
-- =============================================

-- Create enum for usage type (prefixed to avoid conflicts)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bpmn_usage_type') THEN
    CREATE TYPE bpmn_usage_type AS ENUM ('private', 'professional');
  END IF;
END $$;

-- Create bpmn_profiles table (separate from any existing customer/user tables)
CREATE TABLE IF NOT EXISTS bpmn_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  usage_type bpmn_usage_type NOT NULL DEFAULT 'private',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Use existing set_updated_at function from hjordis_gostas project
-- Trigger for bpmn_profiles updated_at
DROP TRIGGER IF EXISTS trg_bpmn_profiles_updated ON bpmn_profiles;
CREATE TRIGGER trg_bpmn_profiles_updated
  BEFORE UPDATE ON bpmn_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security on bpmn_profiles
ALTER TABLE bpmn_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for bpmn_profiles
DROP POLICY IF EXISTS "Users can view own bpmn profile" ON bpmn_profiles;
CREATE POLICY "Users can view own bpmn profile" ON bpmn_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own bpmn profile" ON bpmn_profiles;
CREATE POLICY "Users can update own bpmn profile" ON bpmn_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own bpmn profile" ON bpmn_profiles;
CREATE POLICY "Users can insert own bpmn profile" ON bpmn_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new BPMN user signup
-- NOTE: This trigger is OPTIONAL. If it causes issues, comment out the trigger below
-- and the app will create profiles manually after signup.
CREATE OR REPLACE FUNCTION public.handle_new_bpmn_user()
RETURNS TRIGGER AS $$
DECLARE
  _usage_type bpmn_usage_type;
  _first_name text;
  _last_name text;
BEGIN
  -- Safely get first_name and last_name
  _first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  _last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- Safely cast usage_type, defaulting to 'private' if invalid or missing
  BEGIN
    IF NEW.raw_user_meta_data->>'usage_type' IS NOT NULL THEN
      _usage_type := (NEW.raw_user_meta_data->>'usage_type')::bpmn_usage_type;
    ELSE
      _usage_type := 'private';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    _usage_type := 'private';
  END;

  INSERT INTO public.bpmn_profiles (id, first_name, last_name, usage_type)
  VALUES (NEW.id, _first_name, _last_name, _usage_type)
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    usage_type = EXCLUDED.usage_type;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Failed to create bpmn_profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANT: Comment out or remove this trigger if signup fails with "Database error"
-- The app will create profiles automatically after signup instead
-- DROP TRIGGER IF EXISTS on_auth_user_created_bpmn ON auth.users;
-- CREATE TRIGGER on_auth_user_created_bpmn
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_bpmn_user();

-- =============================================
-- BPMN DIAGRAMS TABLE
-- =============================================

-- Create bpmn_diagrams table
CREATE TABLE IF NOT EXISTS bpmn_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Diagram',
  xml_content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bpmn_diagrams_user_id ON bpmn_diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_bpmn_diagrams_updated_at ON bpmn_diagrams(updated_at DESC);

-- Trigger for bpmn_diagrams updated_at (reusing existing function)
DROP TRIGGER IF EXISTS trg_bpmn_diagrams_updated ON bpmn_diagrams;
CREATE TRIGGER trg_bpmn_diagrams_updated
  BEFORE UPDATE ON bpmn_diagrams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE bpmn_diagrams ENABLE ROW LEVEL SECURITY;

-- Policies for bpmn_diagrams
DROP POLICY IF EXISTS "Users can view own bpmn diagrams" ON bpmn_diagrams;
CREATE POLICY "Users can view own bpmn diagrams" ON bpmn_diagrams
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bpmn diagrams" ON bpmn_diagrams;
CREATE POLICY "Users can insert own bpmn diagrams" ON bpmn_diagrams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bpmn diagrams" ON bpmn_diagrams;
CREATE POLICY "Users can update own bpmn diagrams" ON bpmn_diagrams
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bpmn diagrams" ON bpmn_diagrams;
CREATE POLICY "Users can delete own bpmn diagrams" ON bpmn_diagrams
  FOR DELETE USING (auth.uid() = user_id);
