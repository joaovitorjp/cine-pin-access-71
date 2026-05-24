-- Enable RLS on realtime.messages and authorize only the user's own profile channel
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile channel" ON realtime.messages;
CREATE POLICY "Users can read own profile channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'profile-' || auth.uid()::text
);

DROP POLICY IF EXISTS "Users can join own profile channel" ON realtime.messages;
CREATE POLICY "Users can join own profile channel"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = 'profile-' || auth.uid()::text
);
