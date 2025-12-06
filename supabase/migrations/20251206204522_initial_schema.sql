-- Create users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    exchange_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create food_items table
CREATE TABLE food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    category TEXT,
    location TEXT,
    expiry_date DATE NOT NULL,
    purchase_date DATE,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create shares table (items being shared with community)
CREATE TABLE shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'available', -- available, claimed, completed
    claimer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pickup_time TEXT,
    pickup_notes TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_stats table for tracking impact
CREATE TABLE user_stats (
    user_id UUID REFERENCES profiles(id) PRIMARY KEY,
    money_saved DECIMAL(10,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 1,
    total_shares INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Level 1 Bronze',
    points INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies for food_items
CREATE POLICY "Users can view their own food items" ON food_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food items" ON food_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food items" ON food_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food items" ON food_items
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for shares
CREATE POLICY "Everyone can view available shares" ON shares
    FOR SELECT USING (true);

CREATE POLICY "Users can create shares for their items" ON shares
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own shares" ON shares
    FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = claimer_id);

-- Policies for user_stats
CREATE POLICY "Everyone can view user stats" ON user_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to increment exchange count
CREATE OR REPLACE FUNCTION increment_exchange_count(owner_id UUID, claimer_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE profiles SET exchange_count = exchange_count + 1 WHERE id = owner_id;
    UPDATE profiles SET exchange_count = exchange_count + 1 WHERE id = claimer_id;
    UPDATE user_stats SET total_shares = total_shares + 1 WHERE user_id = owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

