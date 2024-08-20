import { Lightning, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { PlaceHolder } from "./PlaceHolder";

interface CastCardTemplateSpec extends Lightning.Component.TemplateSpec {
  CastCard: {
    PlaceholderSvg: typeof PlaceHolder;
    Label: object;
  };
}

type CastCardProps = {
  src: string;
  id: number;
  name: string;
};

const imageWith = 185 / 2;
const imageHeight = 278 / 2;

export class CastCard extends Lightning.Component<CastCardTemplateSpec> {
  private _id = 0;
  private _name = "";
  private _src = "";
  private _isPlaceholder = false;

  static override _template(): Lightning.Component.Template<CastCardTemplateSpec> {
    return {
      w: imageWith + 10,
      h: imageHeight + 20,
      rect: true,
      color: COLOURS.BLACK_OPACITY_70,
      zIndex: 20,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        w: imageWith + 10,
        h: imageHeight + 20,
        radius: 5,
      },
      flex: {
        direction: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 10,
      },
      CastCard: {
        zIndex: 1,
        y: 5,
        w: imageWith,
        h: imageHeight - 40,
        rect: true,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          w: imageWith,
          h: imageHeight - 40,
          radius: [5, 5, 0, 0],
        },
        Label: {
          x: 0,
          y: 110,
          w: imageWith,
          h: 60,
          flex: {
            direction: "column",
            justifyContent: "center",
            alignItems: "center",
          },
          text: {
            fontSize: 16,
            textAlign: "center",
            textColor: COLOURS.WHITE,
          },
        },
        PlaceholderSvg: {
          type: PlaceHolder,
          props: {
            x: 0,
            y: 0,
          },
          visible: false,
        },
      },
    };
  }

  get idCard(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get srcImage(): string {
    return this._src;
  }

  get CastCard() {
    return this.tag("CastCard");
  }

  get Label() {
    return this.CastCard?.tag("Label");
  }

  set props(props: CastCardProps) {
    const { src, id, name } = props;
    this._id = id;
    this._name = name;
    this._src = src;
    this._isPlaceholder = false;

    this.Label!.patch({
      text: { text: name },
    });

    const imageTexture = {
      type: Lightning.textures.ImageTexture,
      src: src,
      resizeMode: {
        type: "cover" as const,
        w: imageWith + 10,
        h: imageHeight - 40,
        clipY: 0,
      },
    };

    const castCard = this.tag("CastCard");

    castCard!.on("txError", () => {
      this.showPlaceholder();
    });

    castCard!.texture = imageTexture;
  }

  showPlaceholder() {
    if (this._isPlaceholder) {
      return;
    }

    this._isPlaceholder = true;

    this.patch({
      CastCard: {
        texture: {
          zIndex: 1,
          type: Lightning.textures.ImageTexture,
          src: Utils.asset("/images/placeholder.jpg"),
        },
        PlaceholderSvg: {
          props: {
            x: 75,
            y: 50,
          },
          visible: true,
        },
      },
    });
  }
}

export default CastCard;
