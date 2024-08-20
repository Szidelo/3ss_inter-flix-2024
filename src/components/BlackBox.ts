import { Lightning } from "@lightningjs/sdk";

class BlackBox extends Lightning.Component {
  static override _template() {
    return {
      w: 70,
      h: 70,
      rect: true,
      color: 0xff000000,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 20,
      },
      Text: {
        mount: 0.5,
        x: 35,
        y: 40,
        text: {
          text: "",
          fontSize: 48,
          textColor: 0xffffffff,
        },
      },
    };
  }

  override set text(value: any) {
    this.tag("Text").text = value;
  }
}

export default BlackBox;
