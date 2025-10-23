"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import PageLoading from "@/components/GeneralComponents/loading";
import { AuthContext } from "./AuthContext";
import { supabase } from "@/lib/supabase";

export type EventRow = {
  event_id: number;
  events_text: string | null;
  event_desc: string | null;
  uid_sitio: string | null;
  uid_venta: string | null;
  visto: boolean | null;
  nombre_event: string | null;
  created_at: string | null;
  phonenumber: number | null;
  descripcion: string | null;
  user_id: string | null;
  sitio_uuid: string | null;
  sitio_sitioweb: string | null;
  sitio_name: string | null;
  updated_at?: string | null;
};

type ContextType = {
  events: EventRow[];
  setEvents: React.Dispatch<React.SetStateAction<EventRow[]>>;
  loading: boolean;
  error: string | null;
  refetchEvents: () => Promise<void>;
};

export const userContext = createContext<ContextType>({
  events: [],
  setEvents: () => null,
  loading: false,
  error: null,
  refetchEvents: async () => {},
});

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  // Muestra toast de error cuando cambia
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /**
   * Función reutilizable para cargar eventos
   */
  const loadEvents = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_events_with_site",
        { p_user_id: userId }
      );
      if (rpcError) {
        throw new Error(rpcError.message || "Error al cargar eventos");
      }

      setEvents((data ?? []) as EventRow[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error desconocido";

      setError(errorMessage);
      setEvents([]);
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carga eventos cuando el usuario cambia
  useEffect(() => {
    let isMounted = true;

    if (user?.id) {
      loadEvents(user.id).then(() => {
        if (!isMounted) return;
      });
    } else {
      setEvents([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  /**
   * Permite refetching manual de eventos desde componentes
   */
  const refetchEvents = async () => {
    if (user?.id) {
      await loadEvents(user.id);
    }
  };

  const value: ContextType = {
    events,
    setEvents,
    loading,
    error,
    refetchEvents,
  };

  return (
    <userContext.Provider value={value}>
      {loading ? (
        <PageLoading title="Usuario" subtitle="Cargando datos" />
      ) : (
        children
      )}
    </userContext.Provider>
  );
}
