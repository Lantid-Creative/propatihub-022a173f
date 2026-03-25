import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react";

const AgencyAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Track your agency's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Views", value: "5,420", icon: Eye },
          { label: "Leads Generated", value: "128", icon: TrendingUp },
          { label: "Favourites", value: "89", icon: Heart },
          { label: "Inquiries", value: "34", icon: MessageSquare },
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
        <CardHeader><CardTitle>Agency Performance</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground font-body text-sm">Performance data will populate as your agency grows.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgencyAnalytics;
