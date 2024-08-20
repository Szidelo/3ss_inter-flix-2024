import { Lightning, Utils, Router } from "@lightningjs/sdk";
import lng from "@lightningjs/sdk/src/Lightning";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class SplashScreen extends Lightning.Component {
  static override _template() {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT,
      SvgBackground: {
        w: SCREEN_SIZES.WIDTH,
        h: SCREEN_SIZES.HEIGHT,
        zIndex: 0,
        texture: lng.Tools.getSvgTexture(
          Utils.asset("images/background.svg"),
          SCREEN_SIZES.WIDTH,
          SCREEN_SIZES.HEIGHT,
        ),
        Thunder: {
          x: 900,
          y: 540,
          mountX: 0.5,
          mountY: 0.5,
          zIndex: 1,
          alpha: 0,
          texture: lng.Tools.getSvgTexture(Utils.asset("images/logoThunder.svg"), 594, 240.75),
        },
        Name: {
          x: 900,
          y: 540,
          mountX: 0.5,
          mountY: 0.5,
          zIndex: 1,
          alpha: 0,
          texture: lng.Tools.getSvgTexture(Utils.asset("images/logoName.svg"), 594, 240.75),
        },
      },
    };
  }

  static getFonts() {
    return [
      {
        family: "Regular",
        url: Utils.asset("fonts/Roboto-Regular.ttf"),
      },
    ];
  }

  get Name() {
    return this.tag("Name");
  }

  get Thunder() {
    return this.tag("Thunder");
  }

  override async _init() {
    this.stage.transitions.defaultTransitionSettings.duration = 3;

    await this.Name.setSmooth("alpha", 1, {
      duration: 0.5,
      timingFunction: "ease-in-out",
    });
    await this.Name.animation({
      duration: 1.5,
      repeat: 0,
      actions: [{ p: "y", v: { 0: 740, 0.5: 425, 1: 540 } }],
    }).start();

    await delay(2000);
    await this.Thunder.setSmooth("alpha", 1, {
      duration: 0.3,
      timingFunction: "ease-in-out",
    });
    await this.Thunder.animation({
      duration: 1.2,
      repeat: 0,
      actions: [
        { p: "scale", v: { 0: 2, 0.5: 1 } },
        { p: "rotation", v: { 0: 0, 0.25: 0.05, 0.75: -0.05, 1: 0 } },
      ],
    }).start();

    await delay(1500);
    this.Thunder.setSmooth("alpha", 0, { duration: 1 });
    await this.Name.setSmooth("alpha", 0, { duration: 1 });

    await delay(1000);
    Router.navigate("home");
  }
}

export default SplashScreen;
