ALTER TABLE gloses
    ADD COLUMN IF NOT EXISTS themes text[] DEFAULT '{}';
