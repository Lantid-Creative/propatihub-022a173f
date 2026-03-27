import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, UserCheck, Shield, Building, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  agent: "bg-primary/10 text-primary",
  agency: "bg-accent/10 text-accent",
  user: "bg-muted text-muted-foreground",
};

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  agent: UserCheck,
  agency: Building,
  user: Users,
};

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    
    const usersWithRoles = (profiles || []).map((p) => ({
      ...p,
      user_roles: (roles || []).filter((r) => r.user_id === p.user_id),
    }));
    
    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search) ||
      (u.city || "").toLowerCase().includes(search.toLowerCase());
    const userRoles = u.user_roles?.map((r: any) => r.role) || [];
    const matchesRole = roleFilter === "all" || userRoles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const changeRole = async (userId: string, newRole: string) => {
    // Delete existing roles and insert new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });

    // If promoting to agent, ensure agent_profile exists
    if (newRole === "agent") {
      const { data: existing } = await supabase.from("agent_profiles").select("id").eq("user_id", userId).single();
      if (!existing) {
        await supabase.from("agent_profiles").insert({ user_id: userId });
      }
    }

    toast({ title: `User role updated to ${newRole}` });
    fetchUsers();
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.user_roles?.some((r: any) => r.role === "admin")).length,
    agent: users.filter((u) => u.user_roles?.some((r: any) => r.role === "agent")).length,
    agency: users.filter((u) => u.user_roles?.some((r: any) => r.role === "agency")).length,
    user: users.filter((u) => u.user_roles?.some((r: any) => r.role === "user")).length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground font-body text-sm">{users.length} registered users</p>
      </div>

      {/* Role Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(["all", "admin", "agent", "agency", "user"] as const).map((role) => {
          const Icon = role === "all" ? Users : roleIcons[role];
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`p-3 rounded-xl border transition-all text-left ${
                roleFilter === role ? "border-accent bg-accent/5 shadow-sm" : "border-border bg-card hover:border-accent/30"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${roleFilter === role ? "text-accent" : "text-muted-foreground"}`} />
              <p className="text-lg font-display font-bold text-foreground">{roleCounts[role]}</p>
              <p className="text-[10px] font-body text-muted-foreground capitalize">{role === "all" ? "All Users" : `${role}s`}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-xs font-body font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 text-xs font-body font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                  
                  <th className="text-left p-3 text-xs font-body font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 text-xs font-body font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="p-3 text-xs font-body font-medium text-muted-foreground w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const primaryRole = u.user_roles?.[0]?.role || "user";
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                            <span className="text-accent font-display font-bold text-xs">
                              {(u.full_name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-body font-semibold text-foreground text-sm">{u.full_name || "Unnamed"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <p className="text-sm text-muted-foreground font-body">{u.city || "—"}, {u.state || "—"}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.user_roles?.map((r: any) => (
                            <Badge key={r.role} className={`${roleColors[r.role]} text-[10px] capitalize`}>
                              {r.role}
                            </Badge>
                          ))}
                          {(!u.user_roles || u.user_roles.length === 0) && (
                            <Badge className="bg-muted text-muted-foreground text-[10px]">user</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-xs text-muted-foreground font-body">{new Date(u.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {["user", "agent", "agency", "admin"].filter(r => r !== primaryRole).map(role => (
                              <DropdownMenuItem key={role} onClick={() => changeRole(u.user_id, role)}>
                                Make {role.charAt(0).toUpperCase() + role.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground font-body text-sm">No users found.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
