import { useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/realtime-js";

type TableChangeHandler = (
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
) => void;

/**
 * Registro de canales de Supabase Realtime. Se encarga de suscribir,
 * trackear y limpiar todos los canales sin que cada tabla tenga que
 * repetir el try/catch + cleanup a mano.
 */
export function useRealtimeChannelRegistry() {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const subscribe = useCallback(
    (
      channelName: string,
      table: string,
      onChange: TableChangeHandler,
      filter?: string,
    ) => {
      try {
        const channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table,
              ...(filter ? { filter } : {}),
            },
            onChange,
          )
          .subscribe();
        channelsRef.current.push(channel);
      } catch (err) {
        console.error(`[Realtime] Error suscribiendo a ${channelName}:`, err);
      }
    },
    [],
  );

  const unsubscribeAll = useCallback(() => {
    channelsRef.current.forEach((channel) => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error("[Realtime] Error limpiando canal:", err);
      }
    });
    channelsRef.current = [];
  }, []);

  return { subscribe, unsubscribeAll };
}

/**
 * Evita floodear de toasts cuando llegan varios cambios seguidos
 * (ej: un UPDATE masivo dispara N eventos postgres_changes).
 */
export function useToastDebounce(windowMs = 3000) {
  const lastAtRef = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastAtRef.current > windowMs) {
      lastAtRef.current = now;
      return true;
    }
    return false;
  }, [windowMs]);
}
