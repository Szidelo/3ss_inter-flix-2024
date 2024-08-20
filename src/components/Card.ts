import { Lightning, Utils } from "@lightningjs/sdk";
import Router from "@lightningjs/sdk/src/Router";
import eventBus from "./EventBus";
import { COLOURS } from "../../static/constants/Colours";
import PlaceHolder from "./PlaceHolder";

interface CardTemplateSpec extends Lightning.Component.TemplateSpec {
  Card: object;
  Background: object;
  PlaceholderSvg: typeof PlaceHolder;
}

type CardProps = {
  src: string;
  id: number;
  title: string;
  overview: string;
  adult: boolean;
  isMovie: boolean;
  isTop: boolean;
  topIndex?: number;
};

export class Card extends Lightning.Component<CardTemplateSpec> {
  private _id = 0;
  private _title = "";
  private _overview = "";
  private _src = "";
  private _isPlaceholder = false;
  private _adult = false;
  private _isMovieCard = false;
  private _isTopCard = false;
  private _topIndex = 0;

  static override _template(): Lightning.Component.Template<CardTemplateSpec> {
    return {
      Card: {
        y: 50,
        w: 200,
        h: 300,
        zIndex: 1,
        rect: true,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 20,
          stroke: 0,
          strokeColor: COLOURS.ORANGE,
        },
        transitions: {
          scale: { duration: 0.3 },
          color: { duration: 0.3 },
        },
      },
      Background: {
        w: 350,
        h: 300,
        y: 50,
        x: -210,
        zIndex: 0,
        rect: true,
        color: COLOURS.TRANSPARENT,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 20,
        },
        texture: {
          type: Lightning.textures.ImageTexture,
          src: "",
        },
        visible: false,
      },
      PlaceholderSvg: {
        type: PlaceHolder,
        visible: false,
      },
    };
  }

  get idCard(): number {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get adult(): boolean {
    return this._adult;
  }

  get overview(): string {
    return this._overview;
  }

  get srcImage(): string {
    return this._src;
  }

  get isMovieCard(): boolean {
    return this._isMovieCard;
  }

  get isTopCard(): boolean {
    return this._isTopCard;
  }

  get topIndex(): number {
    return this._topIndex;
  }

  get Background() {
    return this.tag("Background");
  }

  set props(props: CardProps) {
    const { src, id, title, overview, isMovie, isTop, topIndex, adult } = props;
    this._id = id;
    this._title = title;
    this._overview = overview;
    this._src = src;
    this._isPlaceholder = false;
    this._isMovieCard = isMovie;
    this._isTopCard = isTop;
    this._topIndex = topIndex || 0;
    this._adult = adult;

    this._topIndex = this._topIndex + 1;
    const imageTexture = {
      type: Lightning.textures.ImageTexture,
      src: src,
    };

    const card = this.tag("Card");

    card!.on("txError", () => {
      this.showPlaceholder();
    });

    card!.texture = imageTexture;

    if (isTop) {
      this.Background?.patch({
        color: COLOURS.WHITE,
        alpha: 0.9,
        texture: {
          src: Utils.asset("images/numbers/" + this.topIndex + ".png"),
        },
        visible: true,
      });
    }
  }

  showPlaceholder() {
    if (this._isPlaceholder) {
      return;
    }

    this._isPlaceholder = true;

    this.patch({
      Card: {
        texture: {
          zIndex: 1,
          type: Lightning.textures.ImageTexture,
          src: Utils.asset("/images/placeholder.jpg"),
        },
      },
      PlaceholderSvg: {
        props: {
          x: 120,
          y: 180,
        },
        visible: true,
      },
    });
  }

  override _focus() {
    this.patch({
      Card: {
        smooth: { scale: 1.1 },
        color: COLOURS.WHITE,
        shader: {
          stroke: 6,
        },
      },
    });
  }

  override _unfocus() {
    this.patch({
      Card: {
        smooth: { scale: 1 },
        color: COLOURS.WHITE,
        shader: {
          stroke: 0,
        },
      },
    });
  }

  override _handleEnter() {
    if (this._adult && localStorage.getItem("parcon") !== '"OFF"') {
      eventBus.emit("showPinOverlay", {
        movieId: this._id,
        isMovie: this._isMovieCard,
      });
    } else {
      Router.navigate((this._isMovieCard ? "movie" : "tvshow") + `/${this._id}`);
    }
  }
}

export default Card;
