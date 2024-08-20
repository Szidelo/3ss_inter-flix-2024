import { Lightning, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { MovieDetailsExtended } from "../utils/interfaces/items/itemsInterface";
import { Button } from "@lightningjs/ui-components";
import KeyValue from "./KeyValue";

interface MovieDetailsOverlayTemplateSpec extends Lightning.Component.TemplateSpec {
  Card: {
    CloseButton: Button;
    LeftInfo: {
      List: {
        type: ListComponentType;
        items: [];
      };
    };
    RightInfo: {
      List: {
        type: ListComponentType;
        items: [];
      };
    };
  };
}

interface ListComponentType extends Lightning.components.ListComponent {
  getElement(index: number): Lightning.Component<any>;
}

class MovieDetailsOverlay extends Lightning.Component<MovieDetailsOverlayTemplateSpec> {
  static override _template() {
    return {
      y: SCREEN_SIZES.HEIGHT / 2 - SCREEN_SIZES.HEIGHT / 15,
      x: 110,
      w: SCREEN_SIZES.WIDTH - 150,
      h: SCREEN_SIZES.HEIGHT / 5,
      rect: true,
      color: COLOURS.TRANSPARENT,
      zIndex: 5,
      visible: false,
      Card: {
        w: SCREEN_SIZES.WIDTH - 150,
        h: SCREEN_SIZES.HEIGHT / 5 + 30,
        rect: true,
        color: COLOURS.BLACK_OPACITY_05,
        zIndex: 4,
        transitions: {
          visible: { duration: 0.5, timingFunction: "ease-in-out" },
          alpha: { duration: 0.5, timingFunction: "ease-in-out" },
        },
        LeftInfo: {
          x: 20,
          y: 20,
          w: (SCREEN_SIZES.WIDTH - 150) / 2 - 40,
          List: {
            type: Lightning.components.ListComponent,
            w: (SCREEN_SIZES.WIDTH - 150) / 2 - 40,
            h: SCREEN_SIZES.HEIGHT / 5,
            itemSize: 230,
            roll: true,
            clipping: true,
            items: [],
            flex: {
              flexDirection: "column",
            },
          },
        },
        RightInfo: {
          x: (SCREEN_SIZES.WIDTH - 150) / 2 + 40,
          y: 20,
          w: (SCREEN_SIZES.WIDTH - 150) / 2 - 40,
          List: {
            type: Lightning.components.ListComponent,
            w: (SCREEN_SIZES.WIDTH - 150) / 2 - 40,
            h: SCREEN_SIZES.HEIGHT / 5,
            itemSize: 230,
            roll: true,
            clipping: true,
            items: [],
            flex: {
              flexDirection: "column",
            },
          },
        },
      },
    };
  }

  get LeftList() {
    return this.tag("Card.LeftInfo.List") as ListComponentType;
  }

  get RightList() {
    return this.tag("Card.RightInfo.List") as ListComponentType;
  }

  showDetails(movie: MovieDetailsExtended | null) {
    if (movie) {
      const leftInfoList = this.tag("Card.LeftInfo.List") as Lightning.components.ListComponent;
      const rightInfoList = this.tag("Card.RightInfo.List") as Lightning.components.ListComponent;

      leftInfoList.items = [];
      rightInfoList.items = [];

      const entries = Object.entries(movie);

      const movieEntries = entries.filter(
        ([key]) =>
          key !== "overview" &&
          key !== "poster_path" &&
          key !== "backdrop_path" &&
          key !== "imdb_id" &&
          key !== "id" &&
          key !== "adult" &&
          key !== "video" &&
          key !== "belongs_to_collection" &&
          key !== "homepage" &&
          key !== "origin_country" &&
          key !== "status" &&
          key !== "id" &&
          key !== "production_countries" &&
          key !== "production_companies" &&
          key !== "runtime" &&
          key !== "revenue" &&
          key !== "tagline" &&
          key !== "original_title" &&
          key !== "vote_count",
      );

      const leftEntries = movieEntries.slice(0, Math.ceil(movieEntries.length / 2));
      const rightEntries = movieEntries.slice(Math.ceil(movieEntries.length / 2));

      const leftEntriesComponents = leftEntries.map((value, index) => ({
        type: KeyValue,
        x: -index * 230,
        y: index * 50,
        props: {
          key: `${this.formatKey(value[0])}:`,
          value: this.formatValue(value[1]),
        },
      }));

      const rightEntriesComponents = rightEntries.map((value, index) => ({
        type: KeyValue,
        x: -index * 230,
        y: index * 50,
        props: {
          key: `${this.formatKey(value[0])}:`,
          value: this.formatValue(value[1]),
        },
      }));

      this.LeftList.items = leftEntriesComponents;
      this.RightList.items = rightEntriesComponents;
      this.patch({
        visible: true,
        alpha: 1,
        Card: {
          LeftInfo: {},
          RightInfo: {},
        },
      });
      this._refocus();
    }
  }

  formatKey(key: string) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatValue(value: any) {
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "object" ? item.name : item)).join(", ");
    }
    return value.toString();
  }

  hideDetails() {
    this.patch({
      alpha: 0,
      visible: false,
    });

    const leftInfoList = this.tag("Card.LeftInfo.List") as Lightning.components.ListComponent;
    const rightInfoList = this.tag("Card.RightInfo.List") as Lightning.components.ListComponent;

    leftInfoList.items = [];
    rightInfoList.items = [];
  }

  override _init() {
    this._setState("Hidden");
    this.tag("Card.CloseButton")?.on("click", () => {
      this.hideDetails();
    });
  }

  override _focus() {
    this.tag("Card.CloseButton")?.setSmooth("alpha", 1);
  }

  get Card() {
    return this.tag("Card");
  }

  get CloseButton() {
    return this.tag("Card.CloseButton");
  }
}

export default MovieDetailsOverlay;
