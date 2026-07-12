export const DIA_NOMBRES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
] as const;

export type DiaNombre = (typeof DIA_NOMBRES)[number];

export interface QuantityDiscount {
  id: number;
  min_qty: number;
  max_qty: number | null;
  type: "percentage" | "fixed" | "quantity";
  value: number;
}
export interface ProductVariant {
  quantity_discounts?: QuantityDiscount[];
  id: string;
  label: string;
  image?: string | null;
  basePrice?: number | null;
  price?: number | null;
  oldPrice?: number | null;
  priceCompra?: number | null;
  stock?: number | null;
  default?: boolean;
  default_variant: boolean;
  visible?: boolean;
  orden?: number;
  sku?: string | null;
  attributes?: Record<string, string | number | boolean>;
  active?: boolean;
  created_at?: string;
  Cant?: number;
  embalaje: number;
  updated_at?: string;
}
export interface CombosInterface {
  caja: string;
  image: string;
  price: number;
  stock: number;
  title: string;
  venta: boolean;
  old_price: number;
  productId: string;
}
export interface Turno {
  id: number;
  open: boolean;
  apertura: string; // "HH:MM:SS"
  cierre: string; // "HH:MM:SS"
  es_24h: boolean;
  cruza_medianoche: boolean;
}

export interface ScheduleInterface {
  dia: DiaNombre;
  fecha: string; // "YYYY-MM-DD"
  turnos: Turno[];
}

export interface EstadoHorario {
  abierto: boolean;
  es_24h: boolean;
  cierra_en_minutos: number | null;
  abre_en_minutos: number | null;
  proximo_cierre: string | null; // "HH:MM"
  proxima_apertura: string | null; // "HH:MM"
}
export interface InfoSections {
  content?: string;
  id?: string;
  label?: string;
  // El icono se guarda como nombre de string (ej: "FileText", "Beaker")
  // y se resuelve a componente en el cliente con el mapa ICON_MAP
  icon?: string;
  order?: number;
}
export interface Product {
  combos?: CombosInterface[];
  productId: string;
  title: string;
  creado: string;
  favorito?: boolean;
  descripcion?: string;
  default_moneda: number;
  caja?: string;
  visible: boolean;
  comparar: boolean;
  caracteristicas: string[];
  id: number;
  order: number;
  storeId?: string;
  visitas: number;
  span?: boolean;
  coment: ComentGeneral;
  venta: boolean;
  variants: ProductVariant[];
  variants_count?: number;
  selected_variant: ProductVariant;
  info_sections?: InfoSections[];
}

export interface Current {
  id: number;
  valor: number;
  nombre: string;
  ui_store: string;
  defecto: boolean;
}
export interface Sends {
  lugar: string;
  precio: number;
}

export interface UbicacionInterface {
  latitude: number;
  longitude: number;
}

export interface Categoria {
  active: boolean;
  storeId?: string;
  description?: string;
  name?: string;
  order?: number;
  image?: string;
  id: string;
  subtienda: boolean;
}

export interface CodeDiscount {
  id: number;
  code?: string;
  discount?: number;
  expiresAt: string;
  storeID?: string;
}

export interface ComentGeneral {
  porEstrellas: StarDistribution;
  promedio: number;
  total: number;
}
export interface Coment {
  cmt?: string;
  name?: string;
  created_at: string;
  star?: number;
  id: number;
  UIProduct?: string;
}

export interface StarDistribution {
  "0": number;
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}
export interface DataComentTienda {
  id: number;
  cmt: string;
  star: number;
  title: string;
  UIStore: string;
  created_at: string;
  user: {
    email: string;
    name: string;
    image: string;
    id: string;
  };
}
export interface ComentTienda {
  porEstrellas: StarDistribution;
  total: number;
  promedio: number;
  data: DataComentTienda[];
}
export interface EditInterface {
  grid: boolean;
  square: boolean;
  horizontal: boolean;
  minimalista: boolean;
}
export interface RedesInterface {
  tipo: "insta" | "face" | "twitter" | "linkenid";
  url: string;
  user: string;
}
export interface ContactInterface {
  tipo: "wa" | "cell" | "mail";
  url: string;
}
interface Blog {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  description: string;
  abstract: string;
  created_at: string;
}
export interface AppState {
  // datos
  Editor?: string;
  CodePromo: boolean;
  Provincia?: string;
  UUID: string;

  act_tf: boolean;
  active: boolean;
  banner?: string;
  blogs: Blog[];
  carrito: boolean;
  categorias: Categoria[];
  cell?: number;
  color: string;
  codeDiscount: CodeDiscount[];
  comentTienda: ComentTienda;
  created_at: string;
  direccion?: string;
  domicilio: boolean;
  email?: string;
  history: string;
  country: string;
  envios?: Sends[];
  font: string;
  horario?: ScheduleInterface[];
  estadoHorario?: EstadoHorario;
  id: number;
  insta: string;
  local: boolean;
  compraUUID?: string;
  login: boolean;
  marketing: boolean;
  limite: number;
  moneda: Current[];
  municipio?: string;
  name?: string;
  parrrafo?: string;
  products: Product[];
  reservas: boolean;
  sitioweb?: string;
  tipo?: string;
  ubicacion?: UbicacionInterface;
  urlPoster: string;
  edit: EditInterface;
  redes: RedesInterface[];
  contacto: ContactInterface[];
  stocks: boolean;
  top: boolean;
  productEnStock: string;
  visitas: number;

  afiliate: string | null;
}

// Estado inicial tipado a AppState
export const initialState: AppState = {
  edit: { grid: true, square: false, horizontal: false, minimalista: false },
  urlPoster: "",
  id: 0,
  blogs: [],
  productEnStock: "",
  color: "oklch(27.8% 0.033 256.848)",
  products: [],
  categorias: [],
  codeDiscount: [],
  comentTienda: {
    porEstrellas: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    total: 0,
    promedio: 0,
    data: [],
  },
  font: "Inter",
  carrito: true,
  marketing: false,
  insta: "",
  history: "",
  country: "",
  domicilio: false,
  act_tf: false,
  tipo: "",
  reservas: false,
  Editor: "",
  cell: 0,
  limite: 0,
  horario: [
    {
      dia: "Domingo",
      fecha: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
      turnos: [
        {
          id: 1,
          apertura: "09:00:00",
          cierre: "18:00:00",
          es_24h: false,
          cruza_medianoche: false,
          open: false,
        },
      ],
    },
  ],
  name: "",
  CodePromo: false,
  parrrafo: "",
  sitioweb: "",
  banner: "",
  login: false,
  UUID: "",
  active: true,
  created_at: new Date().toISOString(),
  envios: [],
  email: "",
  local: false,
  municipio: "",
  moneda: [],
  afiliate: "",
  stocks: false,
  redes: [],
  top: false,
  contacto: [],
  visitas: 0,
};
