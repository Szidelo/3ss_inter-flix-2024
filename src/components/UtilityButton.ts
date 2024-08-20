import { Lightning } from "@lightningjs/sdk";
import { Text } from "./Text";
import Router from "@lightningjs/sdk/src/Router";
import { COLOURS } from "../../static/constants/Colours";
import eventBus from "./EventBus";

interface UtilityButtonTemplateSpec extends Lightning.Component.TemplateSpec {
  Label: typeof Text;
  label: string;
  id: number;
  isMovie: boolean;
  adult: boolean;
  buttonType: string;
}

export class UtilityButton
  extends Lightning.Component<UtilityButtonTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<UtilityButtonTemplateSpec>
{
  private _id: number | undefined;
  private _isMovie = false;
  private _adult = false;
  private _buttonType: string | undefined;

  static override _template(): Lightning.Component.Template<UtilityButtonTemplateSpec> {
    return {
      y: 20,
      w: 200,
      h: 50,
      rect: true,
      color: COLOURS.BLACK_OPACITY_70,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 5,
        stroke: 2,
        strokeColor: COLOURS.ORANGE,
      },
      Label: {
        type: Text,
        w: 200,
        y: 5,
        shader: null,
        text: {
          fontSize: 28,
          fontStyle: "bold",
          textAlign: "center",
          textColor: COLOURS.ORANGE,
        },
      },
    };
  }

  get Label() {
    return this.getByRef("Label");
  }

  set label(text: string) {
    this.patch({
      Label: {
        text: {
          text,
        },
      },
    });
  }

  set isMovie(isMovie: boolean) {
    this._isMovie = isMovie;
  }

  override set id(id: number) {
    this._id = id;
  }

  set adult(adult: boolean) {
    this._adult = adult;
  }

  set buttonType(type: string) {
    // Add setter for buttonType
    this._buttonType = type;
  }

  override _focus() {
    this.patch({
      color: COLOURS.ORANGE,
      Label: {
        text: {
          textColor: COLOURS.RAISIN_BLACK,
        },
      },
    });
  }

  override _unfocus() {
    this.patch({
      color: COLOURS.RAISIN_BLACK,
      Label: {
        text: {
          textColor: COLOURS.ORANGE,
        },
      },
    });
  }

  override _handleEnter() {
    if (this.Label?.text?.text === "More Details") {
      eventBus.emit("showDetails", this);
      this.label = "Less Details";
    } else if (this.Label?.text?.text === "Less Details") {
      eventBus.emit("hideDetails", this);
      this.label = "More Details";
    } else if (this.Label?.text?.text === "+ Details") {
      if (this._adult && localStorage.getItem("parcon") !== '"OFF"') {
        eventBus.emit("showPinOverlay", {
          movieId: this._id,
          isMovie: this._isMovie,
        });
      } else {
        Router.navigate((this._isMovie ? "movie" : "tvshow") + `/${this._id}`);
      }
    } else {
      Router.navigate(`playerPage/${this._id}`);
    }
  }
}

export default UtilityButton;
