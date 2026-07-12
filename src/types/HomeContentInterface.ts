// ─────────────────────────────────────────────────────────────
// types/homeContent.ts
// Tipos completos del retorno de get_home_content()
//
// Actualizado contra el JSON real devuelto por el RPC — varios
// campos existían en la data pero faltaban en los tipos
// (marcados abajo con // + faltaba), y dos arrays no estaban
// declarados en absoluto (trending_catalogs, top_sales_catalogs).
// ─────────────────────────────────────────────────────────────

// ── Shared ────────────────────────────────────────────────────

export interface HeroItem {
  UUID: string;
  title: string;
  image: string;
  description: string;
  visitas: number;
  sitioweb: string;
}

// Campos comunes a products[] y top_posts[]. Antes TopPostItem
// hacía `Omit<ProductItem, "visitas">` pero en la práctica
// products[] trae `sitioweb` y top_posts[] trae `store_sitioweb`
// (nunca los dos a la vez) — separado en una base común.
export interface ProductItemBase {
  productId: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number | null;
  avg_star: number;
  cnt_comments: number;
  score: number;
  store_uuid: string;
  store_name: string;
  store_logo: string;
  category_id: string;
  category_name: string;
  total_stock: number; // + faltaba
  has_variants: boolean; // + faltaba
  has_available: boolean; // + faltaba
  product_created_at: string;
}

export interface ProductItem extends ProductItemBase {
  visitas: number;
  store_sitioweb?: string;
  sitioweb?: string;
}

export interface TopPostItem extends ProductItemBase {
  product_visitas: number;
  store_sitioweb?: string;
  sitioweb?: string;
}

// ── Home ──────────────────────────────────────────────────────

export interface HomeCatalogItem {
  UUID: string;
  name: string;
  image: string;
  banner: string;
  visitas: number;
  avg_star: number;
  sitioweb: string;
  provincia: string;
  tipo: string;
  post: string;
  views_7d?: number; // + faltaba
  orders_7d?: number; // + faltaba
  revenue_30d?: number; // + faltaba
}

export interface FeaturedCatalogItem {
  id: string;
  name: string;
  image: string;
  visitas: number;
  avg_product_star: number;
  store_id: string;
}

export interface CatalogYouMightLikeItem {
  category_id: string;
  category_name: string;
  image: string | null; // el JSON real trae null cuando no hay imagen
  visitas: number;
  store_id: string;
  store_sitioweb: string;
}

export interface PopularCatalogItem {
  id: string;
  name: string;
  image: string;
  visitas: number;
  cat_score: number;
  storeId: string;
  store_sitioweb: string;
}

export interface ProvinceTopSite {
  UUID: string;
  name: string;
  image: string;
  visitas: number;
  sitioweb: string;
}

export interface TopMunicipioItem {
  municipio: string;
  total_visitas: number;
  sitios_count: number;
  top_sites: ProvinceTopSite[];
  image?: string; // + faltaba (imagen genérica de la sección, no del negocio)
}

// ── /catalogs ─────────────────────────────────────────────────

export interface SpotlightItem {
  UUID: string;
  name: string;
  image: string;
  banner: string;
  tipo: string;
  description: string;
  sitioweb: string;
  provincia: string;
  visitas: number;
  avg_star: number;
  cnt_comments: number;
  domicilio: boolean;
  plan: "trial" | "basico" | "pro";
  products_count: number;
  min_price: number;
  max_price: number;
  satisfaction_pct: number;
}

export interface AllCatalogItem {
  UUID: string;
  name: string;
  image: string;
  banner: string;
  tipo: string;
  description: string;
  sitioweb: string;
  provincia: string;
  municipio: string;
  country: string;
  visitas: number;
  avg_star: number;
  cnt_comments: number;
  score: number;
  domicilio: boolean;
  plan: "trial" | "basico" | "pro";
  plan_badge: string;
  verified: boolean;
  created_at: string;
  products_count: number;
  min_price: number;
  max_price: number;
  views_7d: number; // + faltaba
  views_30d: number; // + faltaba
  orders_7d: number; // + faltaba
  orders_30d: number; // + faltaba
  revenue_30d: number; // + faltaba
  trend_score: number; // + faltaba
}

export interface CatalogTypeItem {
  tipo: string;
  count: number;
}

// Nuevo — no existía ningún tipo para esto
export interface TrendingCatalogItem {
  UUID: string;
  name: string;
  tipo: string;
  image: string;
  banner: string;
  sitioweb: string;
  municipio: string;
  provincia: string;
  description: string;
  views_7d: number;
  views_prev_7d: number;
  orders_7d: number;
  revenue_7d: number;
  trend_score: number;
}

// Nuevo — no existía ningún tipo para esto
export interface TopSalesCatalogItem {
  UUID: string;
  name: string;
  tipo: string;
  image: string;
  banner: string;
  sitioweb: string;
  municipio: string;
  provincia: string;
  description: string;
  orders_30d: number;
  revenue_30d: number;
  units_sold_30d: number;
}
export type PlanItem = {
  id: string;
  nombre: string;
  precio_mensual: number;
  max_productos: number;
  descripcion?: string | null;
  marketing?: boolean;
  stocks?: boolean;
  domicilio?: boolean;
  carrito?: boolean;
  soporte_prioritario?: boolean;
  analitycs?: boolean;
  theme?: boolean;
};
// ── Root ──────────────────────────────────────────────────────

export interface HomeContentData {
  // Home sections
  hero: HeroItem[];
  catalogs: HomeCatalogItem[];
  featured_catalogs: FeaturedCatalogItem[];
  products: ProductItem[];
  images?: string[]; // no aparece en el JSON de ejemplo, lo dejo opcional
  catalogsYouMightLike: CatalogYouMightLikeItem[];
  popularCatalogs: PopularCatalogItem[];
  top_posts: TopPostItem[];
  top_municipios: TopMunicipioItem[];
  random_title: string;
  plans: PlanItem[];
  // Catalogs page
  spotlight: SpotlightItem[];
  all_catalogs: AllCatalogItem[];
  catalog_types: CatalogTypeItem[];
  catalog_total_count: number;
  trending_catalogs: TrendingCatalogItem[]; // + faltaba por completo
  top_sales_catalogs: TopSalesCatalogItem[]; // + faltaba por completo
  top_hidden?: boolean; // + faltaba por completo
}
