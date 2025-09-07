export interface Product {
  productId: string;
  title: string;
  image?: string;
  favorito?: boolean;
  descripcion?: string;
  Cant: number;
  caja?: string;
  visible: boolean;
  comparar: boolean;
  caracteristicas: string[];
  id: number;
  oldPrice: number;
  price: number;
  agotado?: boolean;
  creado: string;
  order: number;
  storeId?: string;
  visitas: number;
  span?: boolean;
  coment: ComentGeneral;
  imagesecondary: string[];
  embalaje: number;
  venta: boolean;
  agregados: AgregadosInterface[];
}

export interface AgregadosInterface {
  id: string;
  name: string;
  price: number;
  cant: number;
}
export interface ScheduleInterface {
  dia: string;
  apertura: string;
  cierre: string;
}
export interface Current {
  valor: number;
  moneda: string;
}
export interface Municipios {
  name: string;
  price: number;
}
export interface Sends {
  nombre: string;
  municipios: Municipios[];
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
  name: string;
  star: number;
  title: string;
  UIStore: string;
  created_at: string;
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

export interface AppState {
  // datos
  Editor?: string;
  CodePromo: boolean;
  Provincia?: string;
  UUID: string;

  act_tf: boolean;
  active: boolean;
  banner?: string;
  carrito: boolean;
  categorias: Categoria[];
  cell?: number;
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
  id: number;

  insta: string;
  local: boolean;
  login: boolean;
  marketing: boolean;
  moneda: Current[];
  moneda_default: Current;
  municipio?: string;
  name?: string; // Nombre de la tienda
  parrrafo?: string; // Nombre de la tienda
  products: Product[];
  reservas: boolean;
  sitioweb?: string; // Nombre de la tienda
  tipo?: string;
  ubicacion?: UbicacionInterface; // FIX: Changed 'any' to 'unknown'
  urlPoster: string;
  edit: EditInterface;
  redes: RedesInterface[];
  contacto: ContactInterface[];
}

// Estado inicial tipado a AppState
export const initialState: AppState = {
  edit: { grid: true, square: false, horizontal: false, minimalista: false },
  moneda_default: { valor: 0, moneda: "" },
  urlPoster: "",
  id: 0,
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
  horario: [
    {
      dia: "Domingo",
      cierre: "2025-08-04T00:00:00Z",
      apertura: "2025-08-03T00:00:00Z",
    },
    {
      dia: "Lunes",
      cierre: "2025-08-05T00:00:00Z",
      apertura: "2025-08-04T00:00:00Z",
    },
    {
      dia: "Martes",
      cierre: "2025-08-06T00:00:00Z",
      apertura: "2025-08-05T00:00:00Z",
    },
    {
      dia: "Miercoles",
      cierre: "2025-08-07T00:00:00Z",
      apertura: "2025-08-06T00:00:00Z",
    },
    {
      dia: "Jueves",
      cierre: "2025-08-08T00:00:00Z",
      apertura: "2025-08-07T00:00:00Z",
    },
    {
      dia: "Viernes",
      cierre: "2025-08-09T00:00:00Z",
      apertura: "2025-08-08T00:00:00Z",
    },
    {
      dia: "Sabado",
      cierre: "2025-08-10T00:00:00Z",
      apertura: "2025-08-09T00:00:00Z",
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
  redes: [],
  contacto: [],
};
