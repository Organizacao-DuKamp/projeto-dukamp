import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PROTECTED_ADMIN_EMAIL } from "@/lib/constants";

export type AccountType = "cliente" | "revendedor" | "produtor" | "admin";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  accountType: AccountType;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("cliente");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setIsAdmin(false);
        setAccountType("cliente");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const [rolesR, profileR] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("profiles").select("account_type").eq("id", userId).maybeSingle(),
    ]);
    setIsAdmin(!!rolesR.data);
    const t = ((profileR.data as any)?.account_type ?? "cliente") as AccountType;
    setAccountType(t);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <Ctx.Provider value={{
      user, session, isAdmin,
      isMasterAdmin: (user?.email ?? "").toLowerCase() === PROTECTED_ADMIN_EMAIL.toLowerCase(),
      accountType, loading, signIn, signOut,
    }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

/** Resolve price field based on user account type. Falls back to consumer/legacy. */
export function priceForAccount(p: { price?: number | null; consumer_price?: number | null; reseller_price?: number | null; producer_price?: number | null }, t: AccountType): number {
  if (t === "revendedor" && p.reseller_price != null) return Number(p.reseller_price);
  if (t === "produtor" && p.producer_price != null) return Number(p.producer_price);
  return Number(p.consumer_price ?? p.price ?? 0);
}
