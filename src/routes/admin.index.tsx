import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, FolderTree, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const counts = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [p, c, a, b] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("catalogs").select("*", { count: "exact", head: true }),
        supabase.from("institutional_ads").select("*", { count: "exact", head: true }),
        supabase.from("banners").select("*", { count: "exact", head: true }),
      ]);
      return { products: p.count ?? 0, catalogs: c.count ?? 0, ads: a.count ?? 0, banners: b.count ?? 0 };
    },
  });
  const latest = useQuery({
    queryKey: ["admin", "latest-products"],
    queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });

  const cards = [
    { label: "Produtos", value: counts.data?.products, icon: Package },
    { label: "Catálogos", value: counts.data?.catalogs, icon: FolderTree },
    { label: "Anúncios", value: counts.data?.ads, icon: Megaphone },
    { label: "Banners", value: counts.data?.banners, icon: Megaphone },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Visão geral do e-commerce.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">{c.value ?? "..."}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border bg-card">
        <div className="p-4 border-b font-semibold">Últimos produtos cadastrados</div>
        <div className="divide-y">
          {latest.data?.map((p) => (
            <Link key={p.id} to="/admin/produtos" className="flex items-center justify-between p-4 hover:bg-accent text-sm">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.code}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
