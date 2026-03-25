import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react";

const AgentAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Track your listing performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Profile Views", value: "245", icon: Eye },
          { label: "Listing Views", value: "1,820", icon: TrendingUp },
          { label: "Favorites", value: "38", icon: Heart },
          { label: "Inquiries", value: "12", icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <s.icon className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-body text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Performance Over Time</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground font-body text-sm">Performance charts will populate as your listings get more activity.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgentAnalytics;
