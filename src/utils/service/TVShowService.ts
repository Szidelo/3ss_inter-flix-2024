import { DataFetcher } from "./DataFetcher";
import { URLS } from "../../../static/constants/URLS";
import { convertItemsToCards, convertItemToGallery } from "../formatters/itemMapper";
import { CardItem, GalleryItem } from "../interfaces/items/itemsInterface";

class TVShowService extends DataFetcher {
  async getMostPopularTVShowsCards(): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(URLS.POPULAR_TVSHOWS).then((response) => {
        return response ? convertItemsToCards(response.results) : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async getMostPopularTVShow(): Promise<TVShow | null> {
    try {
      const response = await this.request<ApiResponse>(URLS.POPULAR_TVSHOWS).then((response) => {
        return response ? response.results : null;
      });
      return response ? (response[0] as TVShow) : null;
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      return null;
    }
  }

  async getTVShowDetails(tvShowId: number): Promise<TVShow | null> {
    try {
      const tvShowDetails = await this.request<TVShow>(`tv/${tvShowId}`).then((response) => {
        return response ? response : null;
      });
      return tvShowDetails;
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      return null;
    }
  }

  async getMostPopularTVShowDetails(): Promise<GalleryItem | null> {
    try {
      const tvShow = await this.getMostPopularTVShow();
      if (tvShow) {
        try {
          const tvShowDetails = await this.getTVShowDetails(tvShow.id);
          return tvShowDetails ? convertItemToGallery(tvShowDetails) : null;
        } catch (error) {
          console.error("Error fetching most popular TV show details:", error);
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching most popular TV show details:", error);
      return null;
    }
  }

  async getTopRatedTVCards(): Promise<CardItem[]> {
    try {
      const topTV = await this.request<ApiResponse>("tv/top_rated").then((response) => {
        return response ? convertItemsToCards(response.results.slice(0, 9)) : [];
      });
      return topTV;
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      return [];
    }
  }

  async getTVShowGenres(): Promise<Genre[] | null> {
    try {
      const genres = await this.request<GenreApiResponse>(URLS.GENRE_TVSHOWS).then((response) => {
        return response ? response.genres : null;
      });
      return genres;
    } catch (error) {
      console.error("Error fetching TV show genres:", error);
      return null;
    }
  }
  async searchTVShows(query: string): Promise<CardItem[] | null> {
    try {
      const response = await this.request<ApiResponse>(URLS.SEARCH_TVS + `${query}`).then(
        (response) => {
          return response ? convertItemsToCards(response.results) : null;
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching TV shows by search query:", error);
      return null;
    }
  }

  async getTVShowByGenre(genreId: number): Promise<CardItem[] | null> {
    try {
      const response = await this.request<ApiResponse>(URLS.DISCOVER_TVSHOWS + `${genreId}`).then(
        (response) => {
          return response ? convertItemsToCards(response.results) : [];
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching TV shows by genre:", error);
      return [];
    }
  }

  async getTVShowCredits(tvShowId: number): Promise<Cast[] | null> {
    try {
      const response = await this.request<CastApiResponse>(
        URLS.TVSHOW + `${tvShowId}` + URLS.CREDITS,
      ).then((response) => {
        return response ? response.cast : null;
      });
      return response;
    } catch (error) {
      console.error("Error fetching TV show credits:", error);
      return [];
    }
  }

  async getTVShowVideos(tvShowId: number): Promise<Video[] | null> {
    try {
      const response = await this.request<VideoApiResponse>(
        URLS.TVSHOW + `${tvShowId}` + URLS.VIDEOS,
      ).then((response) => {
        return response ? response.results : null;
      });
      return response;
    } catch (error) {
      console.error("Error fetching TV show videos:", error);
      return [];
    }
  }

  async getSimilarShows(tvShowId: number): Promise<CardItem[]> {
    try {
      const response = await this.request<ApiResponse>(
        URLS.TVSHOW + `${tvShowId}` + URLS.SIMILAR,
      ).then((response) => {
        return response ? convertItemsToCards(response.results) : [];
      });
      return response;
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      return [];
    }
  }

  async getTVShowImages(tvShowId: number): Promise<Logo | null> {
    try {
      const tvShowImages = await this.request<ImageApiResponse>(`tv/${tvShowId}` + URLS.IMAGES);

      return (
        tvShowImages?.logos?.filter(
          (logo) => logo.iso_639_1 === "en" && logo.file_path.endsWith(".png"),
        )?.[0] || null
      );
    } catch (error) {
      console.error("Error fetching TV show images:", error);
      return null;
    }
  }
}

export const tvShowService = new TVShowService();
