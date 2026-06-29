import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/administradores")({
  component: AdminsPage,
});

function AdminsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => (await supabase.from("user_roles").select("*").eq("role", "admin")).data ?? [],
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admins"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Administradores</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Para adicionar novos administradores, crie a conta via tela de login e depois conceda o papel "admin" através do backend.
      </p>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="text-right w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.user_id}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover este administrador?")) remove.mutate(r.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
