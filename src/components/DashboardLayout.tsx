import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Building2, Users, MessageSquare, Heart, Search,
  Settings, LogOut, Menu, X, Home, BarChart3, CreditCard, UserPlus,
  Building, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, roles, signOut, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    if (hasRole("admin")) {
      return [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Properties", href: "/admin/properties", icon: Building2 },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Agents", href: "/admin/agents", icon: UserPlus },
        { label: "Agencies", href: "/admin/agencies", icon: Building },
        { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ];
    }
    if (hasRole("agency")) {
      return [
        { label: "Overview", href: "/agency", icon: LayoutDashboard },
        { label: "Properties", href: "/agency/properties", icon: Building2 },
        { label: "Agents", href: "/agency/agents", icon: Users },
        { label: "Inquiries", href: "/agency/inquiries", icon: MessageSquare },
        { label: "Analytics", href: "/agency/analytics", icon: BarChart3 },
        { label: "Billing", href: "/agency/billing", icon: CreditCard },
        { label: "Settings", href: "/agency/settings", icon: Settings },
      ];
    }
    if (hasRole("agent")) {
      return [
        { label: "Overview", href: "/agent", icon: LayoutDashboard },
        { label: "My Listings", href: "/agent/properties", icon: Building2 },
        { label: "Inquiries", href: "/agent/inquiries", icon: MessageSquare },
        { label: "Analytics", href: "/agent/analytics", icon: BarChart3 },
        { label: "Billing", href: "/agent/billing", icon: CreditCard },
        { label: "Settings", href: "/agent/settings", icon: Settings },
      ];
    }
    return [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Favourites", href: "/dashboard/favourites", icon: Heart },
      { label: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
      { label: "Saved Searches", href: "/dashboard/searches", icon: Search },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ];
  };

  const navItems = getNavItems();
  const portalLabel = hasRole("admin") ? "Admin" : hasRole("agency") ? "Agency" : hasRole("agent") ? "Agent" : "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-lg">P</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">PropatiHub</span>
            </Link>
            <span className="text-xs font-body text-muted-foreground mt-1 block">{portalLabel} Portal</span>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-body font-medium text-foreground">{profile?.full_name || "User"}</p>
              <p className="text-xs font-body text-muted-foreground">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-display font-bold text-sm">
                {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
