-- Fix RLS policy for posts table to allow public read access
DROP POLICY IF EXISTS "Public can read published posts" ON posts;

CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (published = true);