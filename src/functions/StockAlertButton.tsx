"use client";

import { useState } from "react";
import { BellIcon, BellRingIcon, CheckIcon } from "lucide-react";
import { sileo } from "sileo";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AppContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  variantId?: string;
  /** "icon" → botón 32×32 para el grid | "full" → botón full-width para detalle */
  variant?: "icon" | "full";
}

export default function StockAlertButton({
  productId,
  variantId,
  variant = "icon",
}: Props) {
  const { requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  const handleConfirm = async () => {
    setOpen(false);

    const authed = await requireAuth(
      "Iniciá sesión para que te avisemos cuando haya stock",
    );
    if (!authed) return;

    const promise = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) throw new Error("Sin sesión");

      const { error } = await supabase.from("stock_alerts").insert({
        product_id: productId,
        variant_id: variantId ?? null,
        email: user.email,
        user_id: user.id,
      });

      if (error) throw error;
      setDone(true);
    })();

    sileo.promise(promise, {
      loading: { title: "Guardando alerta..." },
      success: { title: "¡Listo!", description: "Te avisamos cuando vuelva." },
      error: { title: "Algo salió mal", description: "Intentá de nuevo." },
    });
  };

  /* ── Trigger según variante ── */
  const trigger =
    variant === "full" ? (
      <button
        type="button"
        aria-label="Avisarme cuando haya stock"
        className={cn(
          "w-full h-13 rounded-full text-[14px] font-semibold transition-all duration-300",
          "flex items-center justify-center gap-2.5 active:scale-[0.98]",
          "border border-[rgba(44,26,14,0.2)]  bg-transparent",
          done && "opacity-60 cursor-not-allowed",
        )}
      >
        {done ? (
          <>
            <CheckIcon className="size-4 text-emerald-500" />
            Ya te avisamos cuando vuelva
          </>
        ) : (
          <>
            <BellIcon className="size-4" />
            Avisarme cuando haya stock
          </>
        )}
      </button>
    ) : (
      /* icon — grid card */
      <button
        type="button"
        aria-label="Avisarme cuando haya stock"
        className={cn(
          "size-7 rounded-md flex items-center justify-center shrink-0",
          "border transition-colors duration-200",
          done
            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
            : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
        )}
      >
        {done ? (
          <CheckIcon className="size-4" />
        ) : (
          <BellIcon className="size-4" />
        )}
      </button>
    );

  if (done && variant === "full") return trigger; // ya registrado, no necesita popover

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        className="w-72 p-4"
        side={variant === "full" ? "top" : "top"}
        align={variant === "full" ? "center" : "end"}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <BellRingIcon className="size-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium leading-snug">
                ¿Te avisamos cuando vuelva?
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Te mandamos un email cuando este producto esté disponible.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 h-8 rounded-md text-xs border border-border bg-transparent hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 h-8 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Avisarme
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
