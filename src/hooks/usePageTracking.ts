import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const getVisitorId = (): string => {
  let id = localStorage.getItem("ph_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ph_visitor_id", id);
  }
  return id;
};

const getSessionId = (): string => {
  let id = sessionStorage.getItem("ph_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("ph_session_id", id);
  }
  return id;
};

export const usePageTracking = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (loading) return;

    const path = location.pathname + location.search;
    if (path === lastPath.current) return;
    lastPath.current = path;

    supabase.from("page_views" as any).insert({
      visitor_id: getVisitorId(),
      user_id: user?.id || null,
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      session_id: getSessionId(),
    });
  }, [location.pathname, location.search, user, loading]);
};
