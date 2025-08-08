/*
  # Assessment System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `status` (text: 'in_progress', 'completed')
      - `current_layer` (integer)
      - `started_at` (timestamp)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
    
    - `assessment_responses`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, references assessments)
      - `layer_number` (integer)
      - `question_id` (text)
      - `response_value` (jsonb)
      - `created_at` (timestamp)
    
    - `assessment_results`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, references assessments)
      - `intelligence_scores` (jsonb)
      - `personality_insights` (jsonb)
      - `career_recommendations` (jsonb)
      - `ai_explanations` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_layer integer DEFAULT 1 CHECK (current_layer >= 1 AND current_layer <= 6),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  layer_number integer NOT NULL CHECK (layer_number >= 1 AND layer_number <= 6),
  question_id text NOT NULL,
  response_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  intelligence_scores jsonb DEFAULT '{}',
  personality_insights jsonb DEFAULT '{}',
  career_recommendations jsonb DEFAULT '[]',
  ai_explanations jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id)
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for assessments
CREATE POLICY "Users can read own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for assessment_responses
CREATE POLICY "Users can read own assessment responses"
  ON assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own assessment responses"
  ON assessment_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own assessment responses"
  ON assessment_responses
  FOR UPDATE
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for assessment_results
CREATE POLICY "Users can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own assessment results"
  ON assessment_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own assessment results"
  ON assessment_results
  FOR UPDATE
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_layer ON assessment_responses(layer_number);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();