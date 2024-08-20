import { Lightning, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";

interface ButtonTemplateSpec extends Lightning.Component.TemplateSpec {
  Image: object;
  Text: object;
}

interface SidebarButtonProps {
  buttonText: string;
  textX: number | ((parentWidth: number) => number);
  textY: number | ((parentHeight: number) => number);
  fontSize: number;
  backgroundColor: number;
  iconColor: number;
  textColor: number;
  src: string;
}

export class SidebarButton
  extends Lightning.Component<ButtonTemplateSpec & SidebarButtonProps>
  implements Lightning.Component.ImplementTemplateSpec<ButtonTemplateSpec>
{
  static override _template(): Lightning.Component.Template<
    ButtonTemplateSpec & SidebarButtonProps
  > {
    return {
      w: 500,
      h: 70,
      rect: true,
      color: COLOURS.WHITE,
      zIndex: 2,
      Image: {
        x: this.bindProp("imageX"),
        w: 50,
        h: 50,
        src: this.bindProp("src"),
        color: this.bindProp("iconColor"),
      },
      Text: {
        x: this.bindProp("textX"),
        y: this.bindProp("textY"),
        mount: 0.5,
        text: {
          text: this.bindProp("buttonText"),
          fontSize: this.bindProp("fontSize"),
          textColor: this.bindProp("textColor"),
          textAlign: "center",
          fontStyle: "bold",
        },
      },
    };
  }

  set iconColor(color: number) {
    this.patch({
      Image: {
        color,
      },
    });
  }

  set buttonText(text: string) {
    this.patch({
      Text: {
        text: {
          text,
        },
      },
    });
  }

  set fontSize(size: number) {
    this.patch({
      Text: {
        text: {
          fontSize: size,
        },
      },
    });
  }

  set textColor(color: number) {
    this.patch({
      Text: {
        text: {
          textColor: color,
        },
      },
    });
  }

  set backgroundColor(color: number) {
    this.patch({
      color,
    });
  }

  set textX(value: number | ((parentWidth: number) => number)) {
    this.patch({
      Text: {
        x: value,
      },
    });
  }

  set textY(value: number | ((parentHeight: number) => number)) {
    this.patch({
      Text: {
        y: value,
      },
    });
  }

  override _focus() {
    this.patch({
      color: COLOURS.TRANSPARENT,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 0,
        stroke: 1,
        strokeColor: COLOURS.BLACK_OPACITY_70,
      },
      Text: {
        shader: null,
        text: {
          textColor: COLOURS.WHITE,
        },
      },
      Image: {
        y: 1,
        color: COLOURS.WHITE,
      },
    });
  }

  override _unfocus() {
    this.patch({
      color: COLOURS.TRANSPARENT,
      shader: null,
      zIndex: 2,
      Text: {
        shader: null,
        text: {
          textColor: COLOURS.ORANGE,
        },
      },
      Image: {
        y: 0,
        color: COLOURS.ORANGE,
      },
    });
  }
}
