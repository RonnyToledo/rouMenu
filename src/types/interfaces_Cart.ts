import { Product } from "./InitialStatus";

export interface CompraInterface {
  pago: string;
  pedido: Product[];
  total: number;
  lugar: string;
  phonenumber: string;
  shipping: number;
  descripcion: string;
  direccion: string;
  code: { discount: number; name: string };
  moneda: string;
  people: string;
}
export interface StoredContact {
  nombre: string;
  phone: string;
  lugar?: string;
  direccion?: string;
  descripcion?: string;
}
export interface UploadCompraInterface {
  UUID_Shop: string;
  events: string;
  date: string;
  desc: CompraInterface;
  descripcion: string;
  uid: string;
  nombre: string;
  phonenumber: string;
  user_id: string;
}
