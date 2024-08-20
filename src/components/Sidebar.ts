import { Lightning, Router, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { SidebarButton } from "./SidebarButton";

const homeIconFontSize = 70;
const settingsIconFontSize = 50;

const homeIconTextY = 25;
const settingsIconTextY = 30;
const defaultTextY = 34;

const defaultAnimationDuration = 0.8;

interface SidebarTemplateSpec extends Lightning.Component.TemplateSpec {
  HomeButton: typeof SidebarButton;
  SettingsButton: typeof SidebarButton;
  SearchButton: typeof SidebarButton;
}

export class Sidebar
  extends Lightning.Component<SidebarTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SidebarTemplateSpec>
{
  static override _template(): Lightning.Component.Template<SidebarTemplateSpec> {
    return {
      w: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
      h: SCREEN_SIZES.HEIGHT,
      rect: true,
      color: COLOURS.BLACK_OPACITY_70,
      shader: { type: Lightning.shaders.FadeOut, right: 0 },
      zIndex: 2,
      HomeButton: {
        type: SidebarButton,
        fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
        src: Utils.asset("images/home.png"),
        x: 25,
        y: SCREEN_SIZES.HEIGHT / 2 - 160,
        h: SCREEN_SIZES.SIDEBAR_ICON_H,
        w: SCREEN_SIZES.SIDEBAR_ICON_W,
        textX: (parentWidth) => parentWidth / 2,
        textY: homeIconTextY,
        buttonText: "",
        textColor: COLOURS.ORANGE,
        iconColor: COLOURS.ORANGE,
        zIndex: 4,
      },
      SettingsButton: {
        type: SidebarButton,
        fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
        src: Utils.asset("images/settings.png"),
        x: 25,
        y: SCREEN_SIZES.HEIGHT / 2 - 80,
        h: SCREEN_SIZES.SIDEBAR_ICON_H,
        w: SCREEN_SIZES.SIDEBAR_ICON_W,
        textX: (parentWidth) => parentWidth / 2,
        textY: settingsIconTextY,
        buttonText: "",
        textColor: COLOURS.ORANGE,
        iconColor: COLOURS.ORANGE,
        zIndex: 4,
      },
      SearchButton: {
        type: SidebarButton,
        fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
        src: Utils.asset("images/search.png"),
        x: 25,
        y: SCREEN_SIZES.HEIGHT / 2,
        h: SCREEN_SIZES.SIDEBAR_ICON_H,
        w: SCREEN_SIZES.SIDEBAR_ICON_W,
        textX: (parentWidth) => parentWidth / 2,
        textY: defaultTextY,
        buttonText: "",
        textColor: COLOURS.ORANGE,
        iconColor: COLOURS.ORANGE,
        zIndex: 4,
      },
    };
  }

  get HomeButton() {
    return this.tag("HomeButton");
  }

  get SettingsButton() {
    return this.tag("SettingsButton");
  }

  get SearchButton() {
    return this.tag("SearchButton");
  }

  override _getFocused() {
    this._setState("HomeButton");
    this._setState("SettingsButton");
    this._setState("SearchButton");
    this._setState("HomeButton");

    return this.HomeButton;
  }

  override _handleRight() {
    Router.focusPage();
  }

  override _enable() {
    this.unfocusPatch();

    const sidebarAnimation = this.animation({
      duration: defaultAnimationDuration + 0.3,
      repeat: 0,
      actions: [
        {
          p: "x",
          v: { 0: -300, 1: 0 },
        },
      ],
    });
    sidebarAnimation.start();
  }

  static override _states() {
    return [
      class HomeButton extends this {
        override _getFocused() {
          return this.HomeButton;
        }

        override _handleDown() {
          this._setState("SettingsButton");
        }

        override _handleUp() {
          return;
        }

        override _handleLeft() {
          return;
        }

        override _handleEnter() {
          Router.navigate("Home");
        }
      },
      class SettingsButton extends this {
        override _getFocused() {
          return this.SettingsButton;
        }

        override _handleUp() {
          this._setState("HomeButton");
        }

        override _handleDown() {
          this._setState("SearchButton");
        }

        override _handleLeft() {
          return;
        }

        override _handleEnter() {
          Router.navigate("settings");
        }
      },
      class SearchButton extends this {
        override _getFocused() {
          return this.SearchButton;
        }

        override _handleUp() {
          this._setState("SettingsButton");
        }

        override _handleLeft() {
          return;
        }

        override _handleDown() {
          return;
        }

        override _handleEnter() {
          Router.navigate("search");
        }
      },
    ];
  }

  createButtonAnimationForFocus(button: Lightning.Component | undefined) {
    return button?.animation({
      duration: defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "w",
          v: {
            0: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
            1: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
          },
        },
        {
          p: "textX",
          v: { 0: -90, 1: 250 },
        },
        {
          p: "imageX",
          v: { 0: -90, 1: 110 },
        },
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "zIndex",
          v: { 0: 0, 1: 4 },
        },
      ],
    });
  }

  override _focus() {
    const focusAnimation = this.animation({
      duration: defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "w",
          v: {
            0: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
            1: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
          },
        },
      ],
    });

    focusAnimation.on("progress", (index: number) => {
      this.patch({
        color: COLOURS.BLACK_OPACITY_70,
        shader: {
          type: Lightning.shaders.FadeOut,
          right: index * SCREEN_SIZES.SIDEBAR_FADE_OUT,
        },
      });
    });

    const homeButtonAnimation = this.createButtonAnimationForFocus(this.HomeButton);
    const settingsButtonAnimation = this.createButtonAnimationForFocus(this.SettingsButton);
    const searchButtonAnimation = this.createButtonAnimationForFocus(this.SearchButton);

    this.focusPatch();

    focusAnimation.start();
    settingsButtonAnimation?.start();
    searchButtonAnimation?.start();
    homeButtonAnimation?.start();
  }

  createButtonAnimationForUnfocus(button: Lightning.Component | undefined) {
    return button?.animation({
      duration: defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "w",
          v: {
            0: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
            1: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
          },
        },
        {
          p: "textX",
          v: { 0: 250, 1: 40 },
        },
        {
          p: "imageX",
          v: { 0: 110, 1: 0 },
        },
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
      ],
    });
  }

  override _unfocus() {
    const unfocusAnimation = this.animation({
      duration: defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "w",
          v: {
            0: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
            1: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
          },
        },
      ],
    });

    unfocusAnimation.on("progress", (index: number) => {
      this.patch({
        color: COLOURS.BLACK_OPACITY_70,
        shader: {
          type: Lightning.shaders.FadeOut,
          right: (1 - index) * SCREEN_SIZES.SIDEBAR_FADE_OUT,
        },
      });
    });

    const homeButtonAnimation = this.createButtonAnimationForUnfocus(this.HomeButton);
    const settingsButtonAnimation = this.createButtonAnimationForUnfocus(this.SettingsButton);

    const searchButtonAnimation = this.createButtonAnimationForUnfocus(this.SearchButton);

    this.unfocusPatch();

    unfocusAnimation.start();
    settingsButtonAnimation?.start();
    searchButtonAnimation?.start();
    homeButtonAnimation?.start();
  }

  unfocusPatch() {
    console.log("Unfocusing sidebar");
    this.patch({
      w: SCREEN_SIZES.SIDEBAR_WIDTH_CLOSED,
      color: COLOURS.BLACK_OPACITY_70,
    });
    this.HomeButton?.patch({
      src: Utils.asset("images/home.png"),
      h: SCREEN_SIZES.SIDEBAR_ICON_H,
      w: SCREEN_SIZES.SIDEBAR_ICON_W,
      buttonText: "",
      fontSize: homeIconFontSize,
      textY: homeIconTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      alpha: 1,
      zIndex: 4,
    });
    this.SettingsButton?.patch({
      src: Utils.asset("images/settings.png"),
      h: SCREEN_SIZES.SIDEBAR_ICON_H,
      w: SCREEN_SIZES.SIDEBAR_ICON_W,
      buttonText: "",
      fontSize: settingsIconFontSize,
      textY: settingsIconTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      alpha: 1,
      zIndex: 4,
    });
    this.SearchButton?.patch({
      src: Utils.asset("images/search.png"),
      h: SCREEN_SIZES.SIDEBAR_ICON_H,
      w: SCREEN_SIZES.SIDEBAR_ICON_W,
      buttonText: "",
      fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
      textY: defaultTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      alpha: 1,
      zIndex: 4,
    });
  }

  focusPatch() {
    this.patch({
      w: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
      color: COLOURS.BLACK_OPACITY_70,
    });
    this.HomeButton?.patch({
      src: Utils.asset("images/home.png"),
      h: 100,
      buttonText: "Home",
      w: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
      fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
      textY: defaultTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      zIndex: 4,
      alpha: 1,
    });
    this.SettingsButton?.patch({
      src: Utils.asset("images/settings.png"),
      h: 100,
      buttonText: "Settings",
      w: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
      fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
      textY: defaultTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      zIndex: 4,
      alpha: 1,
    });
    this.SearchButton?.patch({
      src: Utils.asset("images/search.png"),
      h: 100,
      buttonText: "Search",
      w: SCREEN_SIZES.SIDEBAR_WIDTH_OPEN,
      fontSize: SCREEN_SIZES.DEFAULT_BTN_FONT_SIZE,
      textY: defaultTextY,
      textColor: COLOURS.ORANGE,
      iconColor: COLOURS.ORANGE,
      backgroundColor: COLOURS.TRANSPARENT,
      zIndex: 4,
      alpha: 1,
    });
  }
}
