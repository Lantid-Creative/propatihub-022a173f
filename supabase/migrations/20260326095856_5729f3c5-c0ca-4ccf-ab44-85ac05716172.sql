
-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_text text,
  last_message_at timestamptz
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  content_blocked boolean DEFAULT false,
  blocked_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON public.conversation_participants(conversation_id);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is in conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Conversations: participants can view
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (
    public.is_conversation_participant(auth.uid(), id) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (
    public.is_conversation_participant(auth.uid(), id)
  );

-- Participants: own records
CREATE POLICY "Users can view own participations" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_conversation_participant(auth.uid(), conversation_id) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated can add participants" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own participation" ON public.conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Messages: participants can view/send
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    public.is_conversation_participant(auth.uid(), conversation_id) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    public.is_conversation_participant(auth.uid(), conversation_id) AND sender_id = auth.uid()
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Update trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
