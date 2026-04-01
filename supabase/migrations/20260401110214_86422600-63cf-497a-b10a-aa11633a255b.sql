
-- Add RLS policy on realtime.messages to restrict channel subscriptions
-- Users can only subscribe to conversation channels they participate in
-- and bid channels (which are now restricted to authenticated users)

-- Note: realtime.messages is in the realtime schema which is reserved.
-- Instead, we'll handle this by ensuring the published tables have proper RLS.
-- The bids table SELECT is already restricted to authenticated users.
-- The messages and conversation_participants tables already have proper RLS.

-- Remove bids from realtime publication since bid data is sensitive
ALTER PUBLICATION supabase_realtime DROP TABLE public.bids;
