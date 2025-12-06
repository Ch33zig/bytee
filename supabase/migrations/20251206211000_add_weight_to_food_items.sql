-- Add weight field and make quantity nullable
ALTER TABLE food_items 
    ALTER COLUMN quantity DROP NOT NULL,
    ADD COLUMN weight DECIMAL(10, 2),
    ADD COLUMN weight_unit TEXT;

-- Update existing rows to have quantity = 1 if null
UPDATE food_items SET quantity = 1 WHERE quantity IS NULL;

