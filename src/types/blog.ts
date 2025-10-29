export interface Sitio {
  name: string;
  sitioweb: string;
  tipo: string;
  urlPoster?: string;
}

export interface Post {
  id: number;
  ui_store: string;
  image: string;
  slug: string;
  title: string;
  description: string;
  abstract: string;
  created_at: string;
  Sitios: Sitio;
}
