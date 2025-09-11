/*
  # Tourism Platform Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `email` (text, unique, user's email)
      - `password` (text, hashed password)
      - `phone` (text, phone number)
      - `user_type` (text, either 'tourist' or 'agency')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `agency_profiles` 
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `agency_name` (text, agency/company name)
      - `description` (text, agency description)
      - `services` (text, services offered)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `tours`
      - `id` (uuid, primary key)
      - `agency_user_id` (uuid, foreign key to users)
      - `title` (text, tour title)
      - `destination` (text, tour destination)
      - `description` (text, tour description)
      - `price` (decimal, price per person)
      - `duration` (integer, duration in days)
      - `max_group_size` (integer, maximum group size)
      - `category` (text, tour category)
      - `includes` (text, what's included)
      - `image_url` (text, tour image URL)
      - `is_active` (boolean, tour status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `tourist_user_id` (uuid, foreign key to users)
      - `tour_id` (uuid, foreign key to tours)
      - `number_of_people` (integer, number of people)
      - `booking_date` (date, preferred tour date)
      - `total_amount` (decimal, total booking amount)
      - `special_requests` (text, special requests)
      - `status` (text, booking status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `tourist_user_id` (uuid, foreign key to users)
      - `tour_id` (uuid, foreign key to tours)
      - `rating` (integer, rating 1-5)
      - `comment` (text, review comment)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Users can only access their own data
    - Agencies can manage their own tours and view related bookings
    - Tourists can book tours and leave reviews

  3. Indexes
    - Add indexes on foreign keys and frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('tourist', 'agency')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agency_profiles table
CREATE TABLE IF NOT EXISTS agency_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_name text NOT NULL,
  description text,
  services text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration >= 1),
  max_group_size integer NOT NULL CHECK (max_group_size >= 1),
  category text DEFAULT 'adventure' CHECK (category IN ('adventure', 'cultural', 'wildlife', 'relaxation', 'food', 'historical')),
  includes text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  number_of_people integer NOT NULL CHECK (number_of_people >= 1),
  booking_date date NOT NULL,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  special_requests text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tourist_user_id, tour_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agency_profiles_user_id ON agency_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_agency_user_id ON tours(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_tourist_user_id ON bookings(tourist_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_tourist_user_id ON reviews(tourist_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews(tour_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create RLS policies for agency_profiles table
CREATE POLICY "Agency profiles are viewable by everyone" ON agency_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own agency profile" ON agency_profiles
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Allow agency profile creation during registration" ON agency_profiles
  FOR INSERT TO anon
  WITH CHECK (true);

-- Create RLS policies for tours table
CREATE POLICY "Tours are viewable by everyone" ON tours
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Agencies can manage own tours" ON tours
  FOR ALL TO authenticated
  USING (auth.uid()::text = agency_user_id::text);

-- Create RLS policies for bookings table
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = tourist_user_id::text OR 
    auth.uid()::text IN (SELECT agency_user_id::text FROM tours WHERE tours.id = bookings.tour_id)
  );

CREATE POLICY "Tourists can create bookings" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = tourist_user_id::text);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE TO authenticated
  USING (
    auth.uid()::text = tourist_user_id::text OR 
    auth.uid()::text IN (SELECT agency_user_id::text FROM tours WHERE tours.id = bookings.tour_id)
  );

-- Create RLS policies for reviews table
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Tourists can manage own reviews" ON reviews
  FOR ALL TO authenticated
  USING (auth.uid()::text = tourist_user_id::text);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_profiles_updated_at BEFORE UPDATE ON agency_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();