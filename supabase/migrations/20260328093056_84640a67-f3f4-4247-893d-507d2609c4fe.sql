
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  screen_width integer,
  screen_height integer,
  session_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast analytics queries
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views (visitor_id);
CREATE INDEX idx_page_views_page_path ON public.page_views (page_path);
CREATE INDEX idx_page_views_session_id ON public.page_views (session_id);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (including anonymous visitors)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
