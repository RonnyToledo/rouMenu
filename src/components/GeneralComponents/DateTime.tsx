// components/GeneralComponents/DateTime.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  datetime: string | Date | null;
}

export default function RelativeTime({ datetime }: Props) {
  if (!datetime) return <>—</>;
  const dateObj = typeof datetime === "string" ? new Date(datetime) : datetime;
  return <>{formatDistanceToNow(dateObj, { locale: es, addSuffix: true })}</>;
}
