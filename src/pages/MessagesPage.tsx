import DashboardLayout from "@/components/DashboardLayout";
import ChatView from "@/components/ChatView";

const MessagesPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground font-body text-sm">Chat with agents, agencies, and property owners</p>
      </div>
      <ChatView />
    </DashboardLayout>
  );
};

export default MessagesPage;
