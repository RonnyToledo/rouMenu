import { NextRequest, NextResponse } from "next/server";
import { AppState, EditInterface } from "@/types/InitialStatus";
import { getStoreShell } from "@/lib/storeData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const { shop } = await params;

  // Extraer key desde header o Authorization Bearer
  const headerKey =
    request.headers.get("x-editor-key") ??
    (() => {
      const auth = request.headers.get("authorization");
      if (!auth) return null;
      const parts = auth.split(" ");
      return parts.length === 2 && parts[0].toLowerCase() === "bearer"
        ? parts[1]
        : auth;
    })();
  if (!headerKey) {
    return NextResponse.json({ error: "Editor key required" }, { status: 401 });
  }

  const storeOne = await getStoreShell(shop);

  if (!storeOne) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Obtener el valor del editor (puede venir con distintos nombres según tu RPC)
  // Prueba varias convenciones por si cambia el shape
  const editorValue = `${storeOne.Editor ?? ""}`;

  if (!editorValue) {
    // Si no hay editor definido, denegar acceso (o decide policy distinta)
    return NextResponse.json(
      { error: "Store has no editor configured" },
      { status: 403 },
    );
  }

  // Comparación exacta tal como pediste
  if (headerKey !== editorValue) {
    return NextResponse.json(
      { error: "Unauthorized - editor key mismatch" },
      { status: 401 },
    );
  }

  if (!storeOne.sitioweb) {
    return NextResponse.json({ error: "Not Web" }, { status: 400 });
  }

  if (!storeOne.active) {
    return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  }

  const store = transformData(storeOne);

  return NextResponse.json({ data: store });
}

function transformData(store: AppState): AppState {
  if (!store) return {} as AppState;

  let editParsed = store.edit;

  if (typeof store.edit === "string") {
    try {
      editParsed = JSON.parse(store.edit);
    } catch {
      editParsed = {} as EditInterface;
    }
  }

  return {
    ...store,
    edit: editParsed,
    products:
      store.products?.map((obj) => ({
        ...obj,
        Cant: 0,
        comparar: false,
      })) ?? [],
    envios:
      store.envios?.map((env) => ({
        ...env,
        precio: Number(env.precio),
      })) ?? [],
  };
}
