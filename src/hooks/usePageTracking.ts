import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const lastPath = useRef<string>("");

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("page_views" as any).insert({
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
    };

    trackView();
  }, [location.pathname, location.search]);
};
