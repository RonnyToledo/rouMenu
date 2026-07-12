import React from "react";

export default function FloatingDock({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-2 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">{children}</div>
    </div>
  );
}
