import { TV } from "@lightningjs/sdk";

export const BASE_URL = "https://api.themoviedb.org/3";
export const URLS = {
  POPULAR_MOVIES: "/movie/popular",
  POPULAR_TVSHOWS: "/tv/popular",
  CONFIGURATION: "/configuration",
  GENRE_MOVIES: "/genre/movie/list",
  GENRE_TVSHOWS: "/genre/tv/list",
  DISCOVER_MOVIES: "/discover/movie?sort_by=popularity.desc&with_genres=",
  DISCOVER_TVSHOWS: "/discover/tv?sort_by=popularity.desc&with_genres=",
  MOVIE: "/movie/",
  TVSHOW: "/tv/",
  CREDITS: "/credits",
  VIDEOS: "/videos",
  SIMILAR: "/similar",
  IMAGES: "/images",
  SEARCH_MOVIES: "/search/movie?query=",
  SEARCH_TVS: "/search/tv?query=",
};
