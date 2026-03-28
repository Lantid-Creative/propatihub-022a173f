import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "agent" | "agency" | "user";
type AccountType = "buyer" | "agent" | "agency" | "owner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoading: boolean;
  roles: AppRole[];
  accountType: AccountType | null;
  profile: any;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const fetchUserData = async (userId: string) => {
    setRolesLoading(true);
    const [rolesRes, profileRes, { data: { user } }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.auth.getUser()
    ]);
    if (rolesRes.data) setRoles(rolesRes.data.map((r) => r.role as AppRole));
    if (profileRes.data) setProfile(profileRes.data);
    if (user?.user_metadata?.account_type) setAccountType(user.user_metadata.account_type as AccountType);
    setRolesLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          if (session.user.user_metadata?.account_type) {
            setAccountType(session.user.user_metadata.account_type as AccountType);
          }
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setRoles([]);
          setAccountType(null);
          setProfile(null);
          setRolesLoading(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (session.user.user_metadata?.account_type) {
          setAccountType(session.user.user_metadata.account_type as AccountType);
        }
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, loading, rolesLoading, roles, accountType, profile, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
