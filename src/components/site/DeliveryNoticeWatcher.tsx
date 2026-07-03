import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { getMyDeliveryNotices, markDeliveryNotified } from "@/lib/orders.functions";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function DeliveryNoticeWatcher() {
  const { user } = useAuth();
  const fetchNotices = useServerFn(getMyDeliveryNotices);
  const markNotified = useServerFn(markDeliveryNotified);
  const shown = useRef(false);

  useEffect(() => {
    if (!user || shown.current) return;
    shown.current = true;
    (async () => {
      try {
        const notices = await fetchNotices();
        for (const n of notices) {
          const names = n.product_names.slice(0, 3).join(", ") || "seu pedido";
          toast.success(`Entregue! ${names} chegou ao seu destino.`, {
            description: `Pedido ${n.order_number}`,
            duration: 8000,
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          });
          markNotified({ data: { orderId: n.id } }).catch(() => {});
        }
      } catch {
        // silencia
      }
    })();
  }, [user, fetchNotices, markNotified]);

  return null;
}
