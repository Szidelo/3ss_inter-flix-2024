import { Lightning } from "@lightningjs/sdk";
import SearchInput from "../components/SearchInput";
import { movieService } from "../utils/service/MovieService";
import VerticalList from "../components/VerticalList";
import Carousel from "../components/Carousel";
import { COLOURS } from "../../static/constants/Colours";
import { tvShowService } from "../utils/service/TVShowService";
import { Sidebar } from "../components/Sidebar";
import Router from "@lightningjs/sdk/src/Router";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { Gallery } from "../components/Gallery";
import { getImageUrl } from "../utils";
import Card from "../components/Card";
import eventBus from "../components/EventBus";
import PinOverlay from "../components/PinOverlay";

interface SearchPageTemplateSpec extends Lightning.Component.TemplateSpec {
  Sidebar: typeof Sidebar;
  SearchInput: typeof SearchInput;
  VerticalList: typeof VerticalList;
  Gallery: typeof Gallery;
  PinOverlay: typeof PinOverlay;
}

export default class SearchPage
  extends Lightning.Component<SearchPageTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SearchPageTemplateSpec>
{
  static override _template() {
    return {
      w: 1920,
      h: 1080,
      color: COLOURS.RAISIN_BLACK,
      rect: true,
      SearchInput: {
        type: SearchInput,
        y: 100,
        zIndex: 2,
        signals: {
          focusList: true,
          search: "_onSearch",
          focusSidebar: true,
        },
      },
      Gallery: {
        type: Gallery,
      },
      VerticalList: {
        type: VerticalList,
        x: 100,
        y: -50,
        zIndex: 1,
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

  get Sidebar() {
    return this.tag("Sidebar") as Sidebar;
  }

  get SearchInput() {
    return this.tag("SearchInput") as SearchInput;
  }

  get VerticalList() {
    return this.tag("VerticalList") as VerticalList;
  }

  focusList() {
    this._setState("VerticalList");
  }

  focusSidebar() {
    Router.focusWidget("Sidebar");
  }

  get Gallery() {
    return this.tag("Gallery") as Gallery;
  }

  get PinOverlay() {
    return this.tag("PinOverlay") as PinOverlay;
  }

  override _init() {
    eventBus.on("showPinOverlay", (event: CustomEvent) =>
      this.showPinOverlay(event)
    );
    eventBus.on("pinCorrect", this.hidePinOverlay.bind(this));
    eventBus.on("accessDenied", this.handleAccessDenied.bind(this));
    eventBus.on(
      "setStateOnDetailButton",
      this.setStateOnDetailButton.bind(this)
    );
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
    this._setState("VerticalList");
  }

  setStateOnDetailButton() {
    this.hidePinOverlay();
  }

  handleAccessDenied() {
    this.hidePinOverlay();
  }
  async _onSearch(query: string) {
    const movieResults = await movieService.searchMovies(query);
    const tvResults = await tvShowService.searchTVShows(query);
    const tvShows = new Carousel(this.stage);
    const movies = new Carousel(this.stage);

    tvShows.props = {
      title: "TV Shows found",
      isMovie: false,
      isTop: false,
      getItems: async () => {
        return tvResults || [];
      },
    };
    movies.props = {
      title: "Movies found",
      isMovie: true,
      isTop: false,
      getItems: async () => {
        return movieResults || [];
      },
    };
    if (query !== "") {
      if (movies || tvShows) {
        this.VerticalList!.loadItems([movies, tvShows]);
        this._setState("VerticalList");
        this.patch({
          Gallery: {
            zIndex: 1,
            type: Gallery,
          },
        });
      }
    }
  }

  $onFocusGallery(data: Card) {
    this.Gallery.props = {
      isHomePage: true,
      isMovie: data.isMovieCard,
      logoTitle: data.title,
      title: data.title,
      description: data.overview,
      src: getImageUrl(data.srcImage, "w1280"),
      id: data.idCard,
      showBtn: false,
      showTrailers: false,
      adult: false,
      isCentered: true,
    };
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

  override _enable() {
    this.Gallery.patch({
      zIndex: 1,
    });

    this.Gallery.props = {
      isHomePage: true,
      isMovie: false,
      logoTitle: "",
      title: "",
      description: "",
      src: "",
      id: 0,
      showBtn: false,
      showTrailers: false,
      adult: false,
      isCentered: true,
    };
    this._setState("SearchInput");
    Router.focusPage();
  }

  static override _states() {
    return [
      class VerticalList extends this {
        override _getFocused() {
          return this.tag("VerticalList");
        }
        override _handleUp() {
          const currentIndex = this.VerticalList!.getCurrentIndex;

          if (currentIndex > 0) {
            this.VerticalList!.setCurrentIndex = currentIndex - 1;
            this.VerticalList!.List.setIndex(currentIndex - 1);
            this.signal("$dimGallery", currentIndex - 1);
          } else {
            this._setState("SearchInput");
          }
        }

        override _handleDown() {
          const currentIndex = this.VerticalList!.getCurrentIndex;
          this.signal("$dimGallery", currentIndex);
        }
      },
      class SearchInput extends this {
        override _getFocused() {
          return this.tag("SearchInput");
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
