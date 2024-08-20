import { DataFetcher } from "./DataFetcher";
import { URLS } from "../../../static/constants/URLS";
import { convertItemsToCards, convertItemToGallery } from "../formatters/itemMapper";
import { CardItem, GalleryItem } from "../interfaces/items/itemsInterface";
import { MovieDetailsExtended } from "../interfaces/items/itemsInterface";

class MovieService extends DataFetcher {
  async getMostPopularMoviesCards(): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(URLS.POPULAR_MOVIES).then((response) => {
        return response ? convertItemsToCards(response.results) : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async getMostPopularMovie(): Promise<Movie | null> {
    try {
      const response = await this.request<ApiResponse>(URLS.POPULAR_MOVIES).then((response) => {
        return response ? response.results : null;
      });
      return response ? (response[0] as Movie) : null;
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return null;
    }
  }

  async getMovieDetails(movieId: number): Promise<Movie | null> {
    try {
      const movieDetails = await this.request<Movie>(`movie/${movieId}`).then((response) => {
        return response ? response : null;
      });
      return movieDetails;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  }

  async getMovieImages(movieId: number): Promise<Logo | null> {
    try {
      const movieImages = await this.request<ImageApiResponse>(`movie/${movieId}` + URLS.IMAGES);

      return (
        movieImages?.logos?.filter(
          (logo) => logo.iso_639_1 === "en" && logo.file_path.endsWith(".png"),
        )?.[0] || null
      );
    } catch (error) {
      console.error("Error fetching movie images:", error);
      return null;
    }
  }

  async searchMovies(query: string): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(URLS.SEARCH_MOVIES + query).then(
        (response) => {
          return response ? convertItemsToCards(response.results) : [];
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching movies by search:", error);
      return [];
    }
  }

  async getMovieDetailsExtended(movieId: number): Promise<MovieDetailsExtended | null> {
    try {
      const movieDetails = await this.request<MovieDetailsExtended>(`movie/${movieId}`).then(
        (response) => {
          return response ? response : null;
        },
      );
      return movieDetails;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  }

  async getMostPopularMovieDetails(): Promise<GalleryItem | null> {
    try {
      const movie = await this.getMostPopularMovie();
      if (movie) {
        try {
          const movieDetails = await this.getMovieDetails(movie.id);
          return movieDetails ? convertItemToGallery(movieDetails) : null;
        } catch (error) {
          console.error("Error fetching most popular movie details:", error);
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching most popular movie details:", error);
      return null;
    }
  }

  async getTopRatedMovieCards(): Promise<CardItem[]> {
    try {
      const topMovies = await this.request<ApiResponse>("movie/top_rated").then((response) => {
        return response ? convertItemsToCards(response.results.slice(0, 9)) : [];
      });
      return topMovies;
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      return [];
    }
  }

  async getMovieGenres(): Promise<Genre[] | null> {
    try {
      const genres = await this.request<GenreApiResponse>(URLS.GENRE_MOVIES).then((response) => {
        return response ? response.genres : null;
      });
      return genres;
    } catch (error) {
      console.error("Error fetching movie genres:", error);
      return null;
    }
  }

  async getMoviesByGenre(genreId: number): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(URLS.DISCOVER_MOVIES + `${genreId}`).then(
        (response) => {
          return response ? convertItemsToCards(response.results) : [];
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
      return [];
    }
  }

  async getMovieCredits(movieId: number): Promise<Cast[]> {
    try {
      const response = await this.request<CastApiResponse>(
        URLS.MOVIE + `${movieId}` + URLS.CREDITS,
      ).then((response) => {
        return response ? response.cast : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching movie credits:", error);
      return [];
    }
  }

  async getMovieVideos(movieId: number): Promise<Video[]> {
    try {
      const response = await this.request<VideoApiResponse>(
        URLS.MOVIE + `${movieId}` + URLS.VIDEOS,
      ).then((response) => {
        return response ? response.results : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching movie videos:", error);
      return [];
    }
  }

  async getSimilarMovies(movieId: number): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(
        URLS.MOVIE + `${movieId}` + URLS.SIMILAR,
      ).then((response) => {
        return response ? convertItemsToCards(response.results) : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      return [];
    }
  }
}

export const movieService = new MovieService();
