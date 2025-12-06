-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own food items" ON food_items;

-- Create new policy that allows viewing own items OR shared items
CREATE POLICY "Users can view their own food items and shared items" ON food_items
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        is_shared = true
    );


