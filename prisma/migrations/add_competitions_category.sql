-- Insert the Competitions category
INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
VALUES (
  'comp_' || substr(md5(random()::text), 1, 24),  -- Generate a unique ID with 'comp_' prefix
  'Competitions',
  'competitions',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
); 