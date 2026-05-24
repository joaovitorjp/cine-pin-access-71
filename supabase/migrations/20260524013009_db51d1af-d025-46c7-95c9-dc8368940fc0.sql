
-- Public bucket to mirror remote media (posters, backdrops, banners, logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-mirror', 'media-mirror', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read of mirrored media
DROP POLICY IF EXISTS "Public read media-mirror" ON storage.objects;
CREATE POLICY "Public read media-mirror"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-mirror');

-- Writes are handled only by the edge function using the service role,
-- which bypasses RLS — no INSERT/UPDATE/DELETE policies needed.
