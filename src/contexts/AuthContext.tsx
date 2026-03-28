import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "agent" | "agency" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoading: boolean;
  roles: AppRole[];
  profile: any;
  accountType: "buyer" | "agent" | "agency" | "owner" | null;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [accountType, setAccountType] = useState<"buyer" | "agent" | "agency" | "owner" | null>(null);

  const fetchUserData = async (userId: string, currentUser?: User) => {
    setRolesLoading(true);
    
    // Prioritize metadata if available
    const metaType = currentUser?.user_metadata?.account_type;
    if (metaType) {
      setAccountType(metaType as any);
    }

    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
    ]);
    
    if (rolesRes.data) setRoles(rolesRes.data.map((r) => r.role as AppRole));
    
    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    
    setRolesLoading(false);
  };

  useEffect(() => {
    // First restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.id, currentUser);
      } else {
        setRolesLoading(false);
      }
      setLoading(false);
    });

    // Then listen for subsequent auth changes (sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          // Use setTimeout to avoid deadlock inside onAuthStateChange callback
          setTimeout(() => fetchUserData(currentUser.id, currentUser), 0);
        } else {
          setRoles([]);
          setProfile(null);
          setAccountType(null);
          setRolesLoading(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, loading, rolesLoading, roles, profile, accountType, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
