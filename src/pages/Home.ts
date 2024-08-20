import { Lightning, Router, Utils } from "@lightningjs/sdk";
import { Gallery } from "../components/Gallery";
import { movieService } from "../utils/service/MovieService";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import lng from "@lightningjs/sdk/src/Lightning";
import VerticalList from "../components/VerticalList";
import { Sidebar } from "../components/Sidebar";
import { GalleryItem } from "../utils/interfaces/items/itemsInterface";
import Card from "../components/Card";
import { getImageUrl } from "../utils";
import Carousel from "../components/Carousel";
import { tvShowService } from "../utils/service/TVShowService";
import { convertItemToGallery } from "../utils/formatters/itemMapper";
import PinOverlay from "../components/PinOverlay";
import eventBus from "../components/EventBus";

interface HomePageTemplateSpec extends Lightning.Component.TemplateSpec {
  Sidebar: typeof Sidebar;
  Gallery: typeof Gallery;
  VerticalList: typeof VerticalList;
  PinOverlay: typeof PinOverlay;
}

export class Home
  extends Lightning.Component<HomePageTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<HomePageTemplateSpec>
{
  static override _template() {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT,
      Svg_Background: {
        w: SCREEN_SIZES.WIDTH,
        h: SCREEN_SIZES.HEIGHT,
        zIndex: 0,
        texture: lng.Tools.getSvgTexture(
          Utils.asset("images/background.svg"),
          SCREEN_SIZES.WIDTH,
          SCREEN_SIZES.HEIGHT
        ),
      },
      Gallery: {
        type: Gallery,
      },
      VerticalList: {
        zIndex: 2,
        type: VerticalList,
        x: 100,
        signals: {
          $onFocusGallery: true,
          $dimGallery: true,
        },
      },
      PinOverlay: {
        type: PinOverlay,
        visible: false,
      },
    };
  }

  get PinOverlay() {
    return this.tag("PinOverlay") as PinOverlay;
  }

  get Gallery() {
    return this.tag("Gallery") as Gallery;
  }

  get VerticalList() {
    return this.tag("VerticalList") as VerticalList;
  }

  override async _init() {
    eventBus.on("showPinOverlay", (event: CustomEvent) =>
      this.showPinOverlay(event)
    );
    eventBus.on("pinCorrect", this.hidePinOverlay.bind(this));
    eventBus.on("accessDenied", this.handleAccessDenied.bind(this));
    eventBus.on(
      "setStateOnDetailButton",
      this.setStateOnDetailButton.bind(this)
    );
    const popularMovieDetails = await movieService.getMostPopularMovieDetails();

    const logoTitle = await movieService.getMovieImages(
      popularMovieDetails?.id || 0
    );

    this.patch({
      Gallery: {
        zIndex: 1,
        type: Gallery,
      },
    });

    const backdrop = await movieService.getMovieDetails(
      popularMovieDetails?.id || 0
    );

    console.log("logo title" + logoTitle?.file_path);

    this.Gallery.props = {
      logoTitle: getImageUrl(
        logoTitle?.file_path || "",
        SCREEN_SIZES.LOGO_IMAGE_WIDTH
      ),
      title: popularMovieDetails?.title || "",
      description: popularMovieDetails?.overview || "",
      src: getImageUrl(backdrop?.backdrop_path || "", "w1280"),
      id: popularMovieDetails?.id || 0,
      showBtn: true,
      showTrailers: false,
      isHomePage: true,
      isMovie: true,
      adult: popularMovieDetails?.adult || false,
      isCentered: false,
    };

    const carousels = await this.createCarousels();

    this.VerticalList.loadItems(carousels);

    this._setState("Gallery");
  }

  async createCarousels() {
    const carousels = [];

    const carouselPopularMovies = new Carousel(this.stage);
    carouselPopularMovies.props = {
      title: "Most Popular Movies",
      isMovie: true,
      isTop: false,
      getItems: async () => {
        return await movieService.getMostPopularMoviesCards();
      },
    };
    carousels.push(carouselPopularMovies);

    const carouselTopRatedMovies = new Carousel(this.stage);
    carouselTopRatedMovies.props = {
      title: "Top Rated Movies",
      isMovie: true,
      isTop: true,
      getItems: async () => {
        return await movieService.getTopRatedMovieCards();
      },
    };
    carousels.push(carouselTopRatedMovies);

    const carouselPopularTVShows = new Carousel(this.stage);
    carouselPopularTVShows.props = {
      title: "Most Popular TV Shows",
      isMovie: false,
      isTop: false,
      getItems: async () => {
        return await tvShowService.getMostPopularTVShowsCards();
      },
    };
    carousels.push(carouselPopularTVShows);

    const carouselTopRatedTVShows = new Carousel(this.stage);
    carouselTopRatedTVShows.props = {
      title: "Top Rated TV Shows",
      isMovie: false,
      isTop: true,
      getItems: async () => {
        return await tvShowService.getTopRatedTVCards();
      },
    };
    carousels.push(carouselTopRatedTVShows);

    const genres = await movieService.getMovieGenres();
    if (genres) {
      for (const genre of genres) {
        const carouselGenre = new Carousel(this.stage);
        carouselGenre.props = {
          title: genre.name,
          isMovie: true,
          isTop: false,
          getItems: async () => {
            return await movieService.getMoviesByGenre(genre.id);
          },
        };
        carousels.push(carouselGenre);
      }
    }

    return carousels;
  }

  override async _enable() {
    await this.handleLoadGallery();
    Router.focusPage();
  }

  async $onFocusGallery(data: Card) {
    const logoTitle = data.isMovieCard
      ? await movieService.getMovieImages(data.idCard)
      : await tvShowService.getTVShowImages(data.idCard);

    let backdropPath = "";

    if (data.isMovieCard) {
      const movieDetails = await movieService.getMovieDetails(data.idCard);
      backdropPath = movieDetails?.backdrop_path
        ? getImageUrl(movieDetails.backdrop_path, "w1280")
        : "";
    } else {
      const showDetails = await tvShowService.getTVShowDetails(data.idCard);
      backdropPath = showDetails?.backdrop_path
        ? getImageUrl(showDetails.backdrop_path, "w1280")
        : "";
    }

    const logoTitlePath = logoTitle?.file_path
      ? getImageUrl(logoTitle.file_path, SCREEN_SIZES.LOGO_IMAGE_WIDTH)
      : "";

    this.Gallery.props = {
      title: data.title,
      description: data.overview,
      src: backdropPath,
      id: data.idCard,
      isMovie: data.isMovieCard,
      showBtn: true,
      showTrailers: false,
      logoTitle: logoTitlePath ? logoTitlePath : "",
      isHomePage: true,
      adult: data.adult,
      isCentered: false,
    };
  }
  showPinOverlay(event: CustomEvent) {
    this.PinOverlay.patch({
      visible: true,
      zIndex: 2,
    });
    this.PinOverlay._isMovie = event.detail.isMovie;
    this.PinOverlay.movieId = event.detail.movieId;
    this._setState("PinOverlayFocus");
  }

  hidePinOverlay() {
    console.log("hide from home");

    this.PinOverlay.patch({
      visible: false,
    });
    this._setState("Gallery");
  }

  setStateOnDetailButton() {
    this.hidePinOverlay();
  }

  handleAccessDenied() {
    this.hidePinOverlay();
  }

  $dimGallery(focused: number) {
    this.Gallery.Details.patch({
      smooth: { alpha: focused < 1 ? 1 : 0 },
      transitions: { alpha: { duration: 0.1 } },
    });
    this.Gallery.DetailsBtn.patch({
      smooth: { alpha: focused < 1 ? 1 : 0 },
      transitions: { alpha: { duration: 0.4 } },
    });
    this.Gallery.Details.patch({
      smooth: { y: focused < 1 ? 0 : -50 },
      transitions: { alpha: { duration: 0.4 }, y: { duration: 0.3 } },
    });
    this.Gallery.Description.patch({
      smooth: { alpha: focused < 1 ? 1 : 0 },
      transitions: { alpha: { duration: 0.4 } },
    });
    this.Gallery.Image.patch({
      smooth: { alpha: focused < 2 ? 1 : 0.9 },
      transitions: { alpha: { duration: 0.4 } },
    });
  }

  async handleLoadGallery() {
    const popularMovieDetails = await movieService.getMostPopularMovieDetails();

    const logoTitle = await movieService.getMovieImages(
      popularMovieDetails?.id || 0
    );

    if (popularMovieDetails) {
      const { title, overview, backdrop_path, id, adult } =
        popularMovieDetails as GalleryItem;

      const backdrop = await movieService.getMovieDetails(id);

      this.Gallery.props = {
        logoTitle: getImageUrl(
          logoTitle?.file_path || "",
          SCREEN_SIZES.LOGO_IMAGE_WIDTH
        ),
        title: title,
        description: overview,
        src: getImageUrl(backdrop!.backdrop_path, "w1280"),
        id: id,
        showBtn: true,
        adult: adult,
        showTrailers: false,
        isHomePage: true,
        isMovie: true,
        isCentered: false,
      };

      const alphaAnimation = this.Gallery.animation({
        duration: 3,
        repeat: 0,
        actions: [{ p: "alpha", v: { 0: 0, 0.5: 0.5, 1: 1 } }],
      });
      alphaAnimation.start();
    }
  }

  override _handleBack() {
    return;
  }

  static override _states() {
    return [
      class VerticalList extends this {
        override _getFocused() {
          return this.VerticalList;
        }

        override _handleUp() {
          const currentIndex = this.VerticalList.getCurrentIndex;

          if (currentIndex > 0 && this.VerticalList.List) {
            this.VerticalList.setCurrentIndex = currentIndex - 1;
            this.VerticalList.List.setIndex(currentIndex);
          } else {
            console.log("No more items to go up");
            this._setState("Gallery");
          }
        }
      },
      class Gallery extends this {
        override _getFocused() {
          return this.Gallery;
        }

        override _handleLeft() {
          Router.focusWidget("Sidebar");
        }

        override _handleDown() {
          this._setState("VerticalList");
        }
      },
      class PinOverlayFocus extends this {
        override _getFocused(): PinOverlay {
          return this.PinOverlay;
        }

        override _handleBack() {
          this.PinOverlay.hidePinOverlay();
        }

        override _handleEnter() {
          this.PinOverlay._handleEnter();
        }
      },
    ];
  }
}

export default Home;
