import { Lightning } from "@lightningjs/sdk";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { COLOURS } from "../../static/constants/Colours";
import { Gallery } from "../components/Gallery";
import { movieService } from "../utils/service/MovieService";
import VerticalList from "../components/VerticalList";
import { CastCard } from "../components/CastCard";
import Carousel from "../components/Carousel";
import { MovieDetailsExtended } from "../utils/interfaces/items/itemsInterface";
import { getImageUrl } from "../utils";
import eventBus from "../components/EventBus";
import MovieDetailsOverlay from "../components/DetailsOverlay";
import { tvShowService } from "../utils/service/TVShowService";
import PinOverlay from "../components/PinOverlay";

interface MovieDetailsTemplateSpec extends Lightning.Component.TemplateSpec {
  Gallery: typeof Gallery;
  VerticalList: typeof VerticalList;
  PinOverlay: typeof PinOverlay;
  CastList: (typeof CastCard)[];
  DetailsOverlay: typeof MovieDetailsOverlay;
}

export class MovieDetails
  extends Lightning.Component<MovieDetailsTemplateSpec>
  implements
    Lightning.Component.ImplementTemplateSpec<MovieDetailsTemplateSpec>
{
  private _id: any;
  private _isMovie = true;

  static override _template() {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT,
      color: COLOURS.RAISIN_BLACK,
      rect: true,
      text: {},
      Gallery: {
        type: Gallery,
        x: 0,
        y: 0,
        alpha: 1,
        zIndex: 1,
      },
      CastList: {
        x: 110,
        y: 540,
        w: 1920,
        h: 150,
        zIndex: 1,
        flex: {
          flexDirection: "row",
          paddingLeft: 10,
        },
        children: [],
      },
      VerticalList: {
        y: 200,
        type: VerticalList,
        x: 98,
        zIndex: 1,
      },
      PinOverlay: {
        type: PinOverlay,
        visible: false,
      },
    };
  }

  get Gallery() {
    return this.tag("Gallery") as Gallery;
  }

  get CastList() {
    return this.tag("CastList");
  }

  get VerticalList() {
    return this.tag("VerticalList") as VerticalList;
  }

  get DetailsOverlay() {
    return this.tag("DetailsOverlay") as MovieDetailsOverlay;
  }

  get PinOverlay() {
    return this.tag("PinOverlay") as PinOverlay;
  }

  override set params(param: { id: string; isMovie: boolean }) {
    this._id = Number(param.id);
    this._isMovie = param.isMovie;
  }

  override async _enable() {
    eventBus.on("showPinOverlay", (event: CustomEvent) =>
      this.showPinOverlay(event)
    );
    eventBus.on("pinCorrect", this.hidePinOverlay.bind(this));
    eventBus.on("accessDenied", this.handleAccessDenied.bind(this));
    eventBus.on(
      "setStateOnDetailButton",
      this.setStateOnDetailButton.bind(this)
    );

    this.hidePinOverlay();
    await this.loadData();
  }
  hidePinOverlay() {
    console.log("hidePinOverlay");

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

  showPinOverlay(event: CustomEvent) {
    console.log("showPinOverlay");

    this.PinOverlay.patch({
      visible: true,
      zIndex: 2,
    });
    this.PinOverlay.movieId = event.detail.movieId;
    this._setState("PinOverlayFocus");
  }

  async loadData(id: number = this._id, isMovie: boolean = this._isMovie) {
    this._isMovie = isMovie;

    this._id = id;
    await this.getMovieDetails(isMovie);
    if (isMovie) {
      await this.getCast();
    } else {
      await this.getShowCast();
    }
    await this.getSimilarMovies(isMovie);
  }

  async getMovieDetails(isMovie: boolean) {
    const details = isMovie
      ? await movieService.getMovieDetails(this._id)
      : await tvShowService.getTVShowDetails(this._id);

    const logoTitle = isMovie
      ? await movieService.getMovieImages(this._id)
      : await tvShowService.getTVShowImages(this._id);

    if (details) {
      const title = isMovie
        ? (details as Movie).title
        : (details as TVShow).name;
      const overview = details.overview;
      const backdrop_path = details.backdrop_path;
      const id = details.id;

      this.Gallery!.props = {
        logoTitle: getImageUrl(
          logoTitle?.file_path || "",
          SCREEN_SIZES.LOGO_IMAGE_WIDTH
        ),
        title: title,
        description: overview,
        src: `https://image.tmdb.org/t/p/w1280${backdrop_path}`,
        id: id,
        showTrailers: true,
        showBtn: false,
        isHomePage: false,
        isMovie: isMovie,
        adult: details.adult,
        isCentered: true,
      };
    }

    return details;
  }

  async showDetails() {
    this.Gallery.Details.setSmooth("y", -50, { duration: 0.3 });
    this.CastList?.setSmooth("y", 750, { duration: 0.3 });
    this.VerticalList.setSmooth("y", 400, { duration: 0.3 });
    await movieService
      .getMovieDetailsExtended(this._id)
      .then((response: MovieDetailsExtended | null) => {
        this.Gallery?.MovieDetailsOverlay?.showDetails(response);
      });
  }

  async hideDetails() {
    this.Gallery.Details.setSmooth("y", 0, { duration: 0.3 });
    this.CastList?.setSmooth("y", 540, { duration: 0.3 });
    this.VerticalList.setSmooth("y", 200, { duration: 0.3 });
    this.Gallery?.MovieDetailsOverlay?.hideDetails();
  }

  async getCast() {
    const cast = await movieService.getMovieCredits(this._id);
    console.log("cast", cast);
    if (cast) {
      const items = cast.map((actor, i) => ({
        type: CastCard,
        x: i * 30,
        zIndex: 2,
        props: {
          src: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
          id: actor.id,
          name: actor.name,
        },
      }));
      this.CastList!.children = items.splice(0, 14);
    }
  }

  async getShowCast() {
    const showCast = await tvShowService.getTVShowCredits(this._id);
    const items = showCast!.map((actor, i) => ({
      type: CastCard,
      x: i * 30,
      props: {
        src: `https://image.tmdb.org/t/p/w${
          92 || 154 || 185 || 342 || 500 || 780 || "original"
        }${actor.profile_path}`,
        id: actor.id,
        name: actor.name,
      },
    }));
    this.CastList!.children = items.splice(0, 15);
  }

  async getSimilarMovies(isMovie: boolean) {
    let similarMovies = isMovie
      ? await movieService.getSimilarMovies(this._id)
      : await tvShowService.getSimilarShows(this._id);

    if (similarMovies.length < 5) {
      similarMovies = await movieService.getSimilarMovies(500);
    }

    const similarCarousel = new Carousel(this.stage);

    similarCarousel.props = {
      title: "Similar Movies",
      isMovie: true,
      isTop: false,
      getItems: async () => {
        return similarMovies;
      },
    };

    if (similarMovies) {
      this.VerticalList!.loadItems([similarCarousel]);
      this._setState("Gallery");
    }
  }

  override _init() {
    eventBus.on("showDetails", () => this.showDetails());
    eventBus.on("hideDetails", () => this.hideDetails());
  }

  override _inactive() {
    this.CastList!.children = [];
    this.VerticalList.clearItems();
    this.Gallery.props = {
      src: "",
      title: "",
      description: "",
      logoTitle: "",
      id: 0,
      showTrailers: false,
      showBtn: false,
      isHomePage: false,
      isMovie: true,
      adult: false,
      isCentered: true,
    };
    this.hideDetails();
  }

  static override _states() {
    return [
      class VerticalList extends this {
        override _getFocused() {
          return this.VerticalList;
        }

        override _handleUp() {
          this.Gallery.Details.setSmooth("y", 0, { duration: 0.3 });
          this.CastList?.setSmooth("y", 540, { duration: 0.3 });
          this.VerticalList.setSmooth("y", 200, { duration: 0.3 });
          this._setState("Gallery");
        }
      },
      class Gallery extends this {
        override _getFocused() {
          return this.Gallery;
        }

        override _handleDown() {
          this.hideDetails();
          this.Gallery.Details.setSmooth("y", -150, { duration: 0.3 });
          this.CastList?.setSmooth("y", 340, { duration: 0.3 });
          this.VerticalList.setSmooth("y", 0, { duration: 0.3 });
          this.Gallery.MoreDetails.Label!.text!.text = "More Details";
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

export default MovieDetails;
