-- Restrict writes on media-mirror bucket to service role only (edge function).
-- Public SELECT remains allowed via the bucket's public flag.

CREATE POLICY "media-mirror public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media-mirror');

CREATE POLICY "media-mirror service insert only"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'media-mirror');

CREATE POLICY "media-mirror service update only"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'media-mirror')
WITH CHECK (bucket_id = 'media-mirror');

CREATE POLICY "media-mirror service delete only"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'media-mirror');
