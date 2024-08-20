import Card from "../../../components/Card";
import { Row } from "@lightningjs/ui-components";
import { Gallery } from "../../../components/Gallery";

export interface MovieDetailsExtended {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: any;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: any[];
  production_countries: any[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: any[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface GalleryItem {
  type: typeof Gallery;
  backdrop_path: string;
  id: number;
  overview: string;
  title: string;
  adult: boolean;
}

export interface Item {
  poster_path?: string;
  profile_path?: string;
  title?: string;
  name?: string;
  [key: string]: any;
}

export interface CardItem {
  type: typeof Card;
  src: string;
  w: number;
  h: number;
  title?: string;
  data: Item;
  id?: number;
  overview?: string;
  adult?: boolean;
}

export interface ActorCard {
  type: typeof Card;
  src: string;
  name: string;
}

export interface RowItem {
  type: typeof Row;
  itemSpacing: number;
  h: number;
  neverScroll: boolean;
  items: CardItem[];
}

export interface GalleryItem {
  type: typeof Gallery;
  backdrop_path: string;
  id: number;
  overview: string;
  title: string;
}
