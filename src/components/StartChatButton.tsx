import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  recipientId: string;
  propertyId?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  label?: string;
}

const StartChatButton = ({ recipientId, propertyId, className, variant = "outline", size = "sm", label = "Message" }: Props) => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to start a conversation with the property manager or agent.", 
        variant: "destructive" 
      });
      navigate("/auth");
      return;
    }

    if (user.id === recipientId) return;

    setLoading(true);

    // Check if conversation already exists between these users for this property
    const { data: myParts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    const { data: theirParts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", recipientId);

    const myConvIds = (myParts || []).map(p => p.conversation_id);
    const theirConvIds = (theirParts || []).map(p => p.conversation_id);
    const sharedConvIds = myConvIds.filter(id => theirConvIds.includes(id));

    // If property-specific, check for matching property
    if (propertyId && sharedConvIds.length > 0) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .in("id", sharedConvIds)
        .eq("property_id", propertyId)
        .limit(1);

      if (existing && existing.length > 0) {
        setLoading(false);
        navigateToChat(existing[0].id);
        return;
      }
    } else if (!propertyId && sharedConvIds.length > 0) {
      // Direct message — use first shared conversation without a property
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .in("id", sharedConvIds)
        .is("property_id", null)
        .limit(1);

      if (existing && existing.length > 0) {
        setLoading(false);
        navigateToChat(existing[0].id);
        return;
      }
    }

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({ property_id: propertyId || null })
      .select("id")
      .single();

    if (convError || !conv) {
      toast({ 
        title: "Conversation Error", 
        description: "We could not initialize the secure chat session. Please refresh and try again.", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    // Add both participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: recipientId },
    ]);

    setLoading(false);
    navigateToChat(conv.id);
  };

  const navigateToChat = (convId: string) => {
    const basePath = hasRole("admin") ? "/admin" : hasRole("agency") ? "/agency" : hasRole("agent") ? "/agent" : "/dashboard";
    navigate(`${basePath}/messages?conversation=${convId}`);
  };

  return (
    <Button variant={variant} size={size} onClick={startChat} disabled={loading} className={`gap-1.5 ${className || ""}`}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
      {label}
    </Button>
  );
};

export default StartChatButton;
