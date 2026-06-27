// ─────────────────────────────────────────────────────────────
// types/homeContent.ts
// Tipos completos del retorno de get_home_content()
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

export interface ProductItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  visitas: number;
  avg_star: number;
  cnt_comments: number;
  score: number;
  store_sitioweb: string;
  store_uuid: string;
  store_name: string;
  store_logo: string;
  sitioweb: string;
  product_created_at: string;
  category_id: string;
  category_name: string;
}

export interface TopPostItem extends Omit<ProductItem, "visitas"> {
  product_visitas: number;
  store_sitioweb: string;
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
  image: string;
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

export interface TopProvinceItem {
  provincia: string;
  total_visitas: number;
  sitios_count: number;
  top_sites: ProvinceTopSite[];
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
}

export interface CatalogTypeItem {
  tipo: string;
  count: number;
}

// ── Root ──────────────────────────────────────────────────────

export interface HomeContentData {
  // Home sections
  hero: HeroItem[];
  catalogs: HomeCatalogItem[];
  featured_catalogs: FeaturedCatalogItem[];
  products: ProductItem[];
  images: string[];
  catalogsYouMightLike: CatalogYouMightLikeItem[];
  popularCatalogs: PopularCatalogItem[];
  top_posts: TopPostItem[];
  top_provinces: TopProvinceItem[];
  random_title: string;

  // Catalogs page
  spotlight: SpotlightItem[];
  all_catalogs: AllCatalogItem[];
  catalog_types: CatalogTypeItem[];
  catalog_total_count: number;
}
