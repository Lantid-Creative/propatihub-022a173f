import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { detectPII, getPIIWarningMessage } from "@/lib/piiDetection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, ArrowLeft, AlertTriangle, ShieldCheck, MessageSquare, Building2, User,
  Check, CheckCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  property_id: string | null;
  last_message_text: string | null;
  last_message_at: string | null;
  updated_at: string;
  property?: { title: string; city: string; images: string[] | null } | null;
  participants: { user_id: string; last_read_at: string | null; profile?: { full_name: string | null; avatar_url: string | null } | null }[];
  unread_count?: number;
}

interface ChatViewProps {
  onBack?: () => void;
}

const ChatView = ({ onBack }: ChatViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null }>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      // Get user's conversations
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      if (!parts || parts.length === 0) { setLoadingConvos(false); return; }

      const convIds = parts.map((p) => p.conversation_id);
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (!convos) { setLoadingConvos(false); return; }

      // Get all participants for these conversations
      const { data: allParts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id, last_read_at")
        .in("conversation_id", convIds);

      // Get profiles for all participants
      const userIds = [...new Set((allParts || []).map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      (profiles || []).forEach((p) => { profileMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      setParticipantProfiles(profileMap);

      // Get property info
      const propIds = convos.filter(c => c.property_id).map(c => c.property_id!);
      let propertyMap: Record<string, any> = {};
      if (propIds.length > 0) {
        const { data: props } = await supabase.from("properties").select("id, title, city, images").in("id", propIds);
        (props || []).forEach(p => { propertyMap[p.id] = p; });
      }

      const enriched: Conversation[] = convos.map((c) => {
        const myPart = parts.find(p => p.conversation_id === c.id);
        const cParts = (allParts || []).filter(p => p.conversation_id === c.id);
        return {
          ...c,
          property: c.property_id ? propertyMap[c.property_id] : null,
          participants: cParts.map(p => ({
            user_id: p.user_id,
            last_read_at: p.last_read_at,
            profile: profileMap[p.user_id] || null,
          })),
        };
      });

      setConversations(enriched);
      setLoadingConvos(false);
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;
    setLoadingMessages(true);
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversation)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
      setLoadingMessages(false);

      // Mark as read
      if (user) {
        await supabase
          .from("conversation_participants")
          .update({ last_read_at: new Date().toISOString() })
          .eq("conversation_id", activeConversation)
          .eq("user_id", user.id);
      }
    };
    fetchMessages();
  }, [activeConversation, user]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeConversation) return;
    const channel = supabase
      .channel(`messages-${activeConversation}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversation}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConversation]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // PII check on typing
  useEffect(() => {
    if (!newMessage.trim()) { setPiiWarning(null); return; }
    const matches = detectPII(newMessage);
    if (matches.length > 0) {
      setPiiWarning(getPIIWarningMessage(matches));
    } else {
      setPiiWarning(null);
    }
  }, [newMessage]);

  const sendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;

    const matches = detectPII(newMessage);
    if (matches.length > 0) {
      // Block the message
      setSending(true);
      const types = [...new Set(matches.map(m => m.label))];
      await supabase.from("messages").insert({
        conversation_id: activeConversation,
        sender_id: user.id,
        content: "⚠️ [Message blocked — contained personal information]",
        content_blocked: true,
        blocked_reason: types.join(", "),
      });
      // Update conversation
      await supabase.from("conversations").update({
        last_message_text: "[Message blocked]",
        last_message_at: new Date().toISOString(),
      }).eq("id", activeConversation);

      toast({
        title: "Message blocked",
        description: "Your message contained personal information. For safety, all communication must stay within PropatiHub.",
        variant: "destructive",
      });
      setNewMessage("");
      setSending(false);
      return;
    }

    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: activeConversation,
      sender_id: user.id,
      content: newMessage.trim(),
      content_blocked: false,
    });
    await supabase.from("conversations").update({
      last_message_text: newMessage.trim().substring(0, 100),
      last_message_at: new Date().toISOString(),
    }).eq("id", activeConversation);

    setNewMessage("");
    setSending(false);
  };

  const getOtherParticipant = (conv: Conversation) => {
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other?.profile?.full_name || "User";
  };

  const getOtherAvatar = (conv: Conversation) => {
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other?.profile?.full_name?.[0]?.toUpperCase() || "U";
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const formatTime = (d: string) => {
    return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Mobile: show list or thread
  const showThread = !!activeConversation;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card rounded-xl border border-border overflow-hidden">
      {/* Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${showThread ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="font-display font-bold text-foreground text-lg">Messages</h2>
          </div>
        </div>

        {/* Platform Disclaimer */}
        <div className="px-4 py-2.5 bg-accent/5 border-b border-accent/10">
          <p className="text-[10px] text-accent font-body font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            All chats &amp; transactions must happen on PropatiHub only.
          </p>
          <p className="text-[10px] text-muted-foreground font-body ml-[18px] mt-0.5">
            Off-platform dealings are not protected. Never share personal details.
          </p>
        </div>

        <ScrollArea className="flex-1">
          {loadingConvos ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">No conversations yet</p>
              <p className="text-xs text-muted-foreground font-body mt-1">Start a conversation from a property listing</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                    activeConversation === conv.id ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-accent font-display font-bold text-sm">{getOtherAvatar(conv)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-body font-semibold text-foreground text-sm truncate">{getOtherParticipant(conv)}</p>
                        <span className="text-[10px] text-muted-foreground font-body shrink-0">
                          {conv.last_message_at ? timeAgo(conv.last_message_at) : ""}
                        </span>
                      </div>
                      {conv.property && (
                        <p className="text-[10px] text-accent font-body flex items-center gap-1 mt-0.5">
                          <Building2 className="w-2.5 h-2.5" /> {conv.property.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-body truncate mt-0.5">
                        {conv.last_message_text || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className={`flex-1 flex flex-col ${!showThread ? "hidden md:flex" : "flex"}`}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-body">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-3 border-b border-border flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversation(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {(() => {
                const conv = conversations.find(c => c.id === activeConversation);
                if (!conv) return null;
                return (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-accent font-display font-bold text-xs">{getOtherAvatar(conv)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm truncate">{getOtherParticipant(conv)}</p>
                      {conv.property && (
                        <p className="text-[10px] text-muted-foreground font-body truncate">
                          Re: {conv.property.title}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center gap-1 text-[10px] text-primary font-body">
                <ShieldCheck className="w-3 h-3" /> Protected
              </div>
            </div>

            {/* Security Banner */}
            <div className="px-4 py-2.5 bg-primary/5 border-b border-primary/10">
              <p className="text-[10px] text-primary font-body flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                All conversations are monitored. Sharing personal contact info or bank details is not allowed.
              </p>
              <p className="text-[10px] text-muted-foreground font-body ml-[18px] mt-0.5">
                All chats and transactions must be conducted exclusively on PropatiHub. Off-platform dealings are prohibited and not protected.
              </p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground font-body">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const senderName = participantProfiles[msg.sender_id]?.full_name || "User";

                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${isMine ? "order-2" : ""}`}>
                        {!isMine && (
                          <p className="text-[10px] text-muted-foreground font-body mb-0.5 ml-1">{senderName}</p>
                        )}
                        <div className={`px-3 py-2 rounded-2xl ${
                          msg.content_blocked
                            ? "bg-destructive/10 border border-destructive/20"
                            : isMine
                              ? "bg-accent text-accent-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          {msg.content_blocked ? (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                              <span className="text-xs text-destructive font-body">{msg.content}</span>
                            </div>
                          ) : (
                            <p className="text-sm font-body whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                        </div>
                        <p className={`text-[9px] text-muted-foreground font-body mt-0.5 ${isMine ? "text-right mr-1" : "ml-1"}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* PII Warning */}
            {piiWarning && (
              <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
                <p className="text-xs text-destructive font-body flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {piiWarning}
                </p>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 ${piiWarning ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || sending}
                  className={piiWarning ? "bg-destructive hover:bg-destructive/90" : ""}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatView;
