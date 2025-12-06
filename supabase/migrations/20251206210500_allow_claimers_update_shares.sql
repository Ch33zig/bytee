-- Drop the old update policy for shares
DROP POLICY IF EXISTS "Users can update their own shares" ON shares;

-- Create new policy that allows:
-- 1. Owners to update their shares
-- 2. Anyone to claim available shares (claimer_id is NULL initially)
-- 3. Claimers to update shares they claimed
CREATE POLICY "Users can update shares appropriately" ON shares
    FOR UPDATE USING (
        auth.uid() = owner_id 
        OR 
        auth.uid() = claimer_id 
        OR 
        (status = 'available' AND claimer_id IS NULL)
    );

