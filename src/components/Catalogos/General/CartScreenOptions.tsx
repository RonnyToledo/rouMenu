"use client";

import React, { useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MyContext } from "@/context/MyContext";
import { smartRound } from "@/functions/precios";
import { Product } from "@/context/InitialStatus";
import { MdOutlineShoppingCart } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logoApp } from "@/lib/image";
import { ShoppingCart } from "lucide-react";
import { getTotalFinal } from "@/functions/getTotalPedido";
import { ListCard } from "./DrawerCart";

export default function CartScreenOptions() {
  const { store, dispatchStore } = useContext(MyContext);
  const [contentCart, setContentCart] = useState<number>(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleToCart = (productToCart: Product) => {
    dispatchStore({
      type: "AddCart",
      payload: JSON.stringify(productToCart),
    });
  };

  const getTotalItems = () => {
    return store.products.reduce(
      (total, item) =>
        total +
        item.Cant +
        (item?.agregados.reduce((sum, agg) => (sum = sum + agg.cant), 0) || 0),
      0
    );
  };

  useEffect(() => {
    const value = store.products.reduce(
      (total, item) =>
        total +
        ((item.price || 0) + item.embalaje) * item.Cant +
        (item?.agregados.reduce(
          (sum, agg) => (sum = sum + (agg.price + item.embalaje)) * agg.cant,
          0
        ) || 0),
      0
    );
    setContentCart(value);
    if (value === 0) setOpenDrawer(false);
  }, [store.products]);

  function RedirectLink(Id: string, categoria: string) {
    if (DetectCategoria(categoria, store.categorias)) {
      //IR a categoria especifica
      if (pathname.includes("/category/")) {
        // Si estamos en la pagina de categorias
        const element = document.getElementById(Id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push(`/t/${store.sitioweb}/category/${categoria}#${Id}`);
      }
    } else {
      // IR a home"
      if (!pathname.includes("/category/")) {
        // Si estamos en la pagina de home
        const element = document.getElementById(Id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push(`/t/${store.sitioweb}#${Id}`);
      }
    }
    setOpenDrawer(false);
  }
  const GoToCart = async () => {
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 1700));
    setIsAddingToCart(false);
    setShowSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setShowSuccess(false);
    router.push(`/t/${store.sitioweb}/carrito`);
    setOpenDrawer(false);
  };
  return (
    <div className="border border-slate-400 rounded-lg h-fit sticky top-14">
      <div className=" bg-white border-t  shadow-lg  mx-auto">
        <Button
          variant={"ghost"}
          className="flex items-center w-full justify-between py-2 px-4 h-auto"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <ShoppingCart />{" "}
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {getTotalItems()}
              </Badge>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {getTotalItems()}{" "}
                {getTotalItems() === 1 ? "producto" : "productos"}
              </p>
              <p className="text-xs text-gray-500">
                Total: ${getTotalFinal(store, store.products)}
              </p>
            </div>
          </div>
          <div className="border border-gray-400 flex items-center p-1 rounded-lg">
            <MdOutlineShoppingCart />
            Ver Pedido
          </div>
        </Button>
      </div>

      {store.products.map((item) => (
        <div key={item.id}>
          {item.Cant !== 0 && (
            <ListCard
              productId={item.productId || ""}
              caja={item.caja || ""}
              default_moneda={item.default_moneda}
              RedirectLink={RedirectLink}
              title={item.title || "Producto"}
              image={item.image || store.urlPoster || logoApp}
              cantidad={item.Cant}
              embalaje={item.embalaje}
              price={smartRound(item.price || 0)}
              handleToCart={() =>
                handleToCart({
                  ...item,
                  Cant: 0,
                })
              }
            />
          )}
          {item.agregados.map(
            (agg, index) =>
              agg.cant !== 0 && (
                <ListCard
                  productId={item.productId || ""}
                  caja={item.caja || ""}
                  key={index}
                  default_moneda={item.default_moneda}
                  embalaje={item.embalaje}
                  RedirectLink={RedirectLink}
                  title={`${item.title}-${agg.name}` || "Producto"}
                  image={item.image || store.urlPoster || logoApp}
                  cantidad={agg.cant}
                  price={smartRound(agg.price || 0)}
                  handleToCart={() =>
                    handleToCart({
                      ...item,
                      agregados: item.agregados.map((obj) =>
                        obj.id === agg.id ? { ...obj, cant: 0 } : obj
                      ),
                    })
                  }
                />
              )
          )}
        </div>
      ))}
    </div>
  );
}
