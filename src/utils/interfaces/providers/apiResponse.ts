interface BaseItem {
  backdrop_path: string;
  id: number;
  overview: string;
  poster_path: string;
  media_type: string;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
}

interface Movie extends BaseItem {
  title: string;
  original_title: string;
  release_date: string;
  video: boolean;
  runtime: number;
}

interface TVShow extends BaseItem {
  name: string;
  original_name: string;
  first_air_date: string;
  origin_country: string[];
}

interface Genre {
  id: number;
  name: string;
}

interface Cast extends BaseItem {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

interface Logo {
  aspect_ratio: number;
  height: number;
  iso_639_1: string;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

interface ApiResponse {
  page: number;
  results: Array<Movie | TVShow | Video>;
  total_pages: number;
  total_results: number;
}

interface VideoApiResponse {
  id: number;
  results: Array<Video>;
}

interface ImageApiResponse {
  backdrops: Array<any>;
  posters: Array<any>;
  id: number;
  logos: Array<Logo>;
}

interface CastApiResponse {
  id: number;
  cast: Array<Cast>;
}

interface GenreApiResponse {
  genres: Array<Genre>;
}
