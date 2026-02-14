export interface DataInterface {
  sections?: ContectDataInterace[];
}

export interface ContectDataInterace {
  id?: string;
  title?: string;
  slug?: string;
  icon?: string;
  description?: string;
  heroImage?: ImageInterface;
  sections?: SectionsInterace[];
  subsections?: SubsectionsInterace[];
  badges?: BadgeInterace[];
  links?: LinkInterace[];
}

export interface SectionsInterace {
  id?: string;
  title?: string;
  slug?: string;
  icon?: string;
  image?: ImageInterface;
  description?: string;
  alert?: AlertInterace;
  cards?: SectionCardInterface[];
  items?: ItemsSectionInterface[];
}

export interface SubsectionsInterace extends ContectDataInterace {
  id?: string;
  description?: string;
  slug?: string;
  image?: ImageInterface;
  title?: string;
  icon?: string;
  sections?: SectionsInterace[];
}

export interface ItemsSectionInterface {
  title?: string;
  description?: string;
}

export interface BadgeInterace {
  text?: string;
  icon?: string;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline"; // Permite cualquier string
}

export interface AlertInterace {
  title?: string;
  description?: string;
  icon?: string;
  className?: string;
}

export interface LinkInterace {
  title?: string;
  description?: string;
  url?: string;
  icon?: string;
  buttonText?: string;
  variant?:
    | "link"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | null
    | undefined;
}

export interface SectionCardInterface {
  title?: string;
  description?: string;
  icon?: string;
  className?: string;
  content?: string;
  image?: ImageInterface;
  items?: string[]; // Cambié de required a optional
}

export interface ImageInterface {
  url?: string; // Cambié a optional
  alt?: string; // Cambié a optional
  caption?: string; // Cambié a optional
}
