import { Lightning } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
interface SettingsButtonTemplateSpec extends Lightning.Component.TemplateSpec {
  Label: typeof Text;
}

export class SettingsButton
  extends Lightning.Component<SettingsButtonTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SettingsButtonTemplateSpec>
{
  buttonText: string | undefined;

  static override _template(): Lightning.Component.Template<SettingsButtonTemplateSpec> {
    return {
      w: 360,
      h: 160,
      rect: true,
      color: 0x00000000,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 15,
        stroke: 2,
        strokeColor: COLOURS.GREY,
      },
      Label: {
        x: 180,
        y: 80,
        mount: 0.5,
        text: {
          fontSize: 40,
          fontStyle: "normal",
          fontFace: "system-ui",
        },
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          strokeColor: 0x00000000,
        },
      },
    };
  }

  get Label() {
    return this.tag("Label")!;
  }
  override _init() {
    this.Label.patch({ text: { text: this.buttonText } });
  }
  override _focus() {
    if (this.ref === "LANG") {
      this.signal("toggleLanguages", 1);
      this.signal("toggleParcon", 0);
    } else if (this.ref === "PARCON") {
      this.signal("toggleParcon", 1);
      this.signal("toggleLanguages", 0);
    }
    this.patch({
      shader: {
        strokeColor: COLOURS.WHITE,
      },
    });
  }
  override _unfocus() {
    this.patch({
      shader: {
        strokeColor: COLOURS.GREY,
      },
    });
  }
}
