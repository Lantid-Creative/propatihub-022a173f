import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users } from "lucide-react";

const AdminAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Page Views", value: "12,450", icon: Eye, change: "+12%" },
          { label: "New Users", value: "340", icon: Users, change: "+8%" },
          { label: "Listings Created", value: "85", icon: BarChart3, change: "+15%" },
          { label: "Conversion Rate", value: "3.2%", icon: TrendingUp, change: "+0.5%" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-body text-primary font-medium">{s.change}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-body text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Traffic Overview</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground font-body text-sm">Chart visualization will be displayed here as data accumulates.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
