import { Lightning, Router } from "@lightningjs/sdk";
import { SettingsColumn } from "../components/SettingsColumn";
import { SettingsButton } from "../components/SettingsButton";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { COLOURS } from "../../static/constants/Colours";
import { PARCON_OPTIONS, LANGUAGE_OPTIONS } from "../../static/constants/SettingsOptions";
import eventBus from "../components/EventBus";
import PinOverlay from "../components/PinOverlay";
import { KEYS } from "../../static/constants/Keys";
import { getPressedKey } from "../../static/constants/Keys";
import { Sidebar } from "../components/Sidebar";
interface SettingsPageTemplateSpec extends Lightning.Component.TemplateSpec {
  Content: {
    MainColumn: {
      LanguageButton: typeof SettingsButton;
      ParconButton: typeof SettingsButton;
    };
    OptionsColumn: {
      LanguageOptions: typeof SettingsColumn;
      ParconOptions: typeof SettingsColumn;
    };
    Line: object;
    PinOverlay: typeof PinOverlay;
    Sidebar: typeof Sidebar;
  };
}

export default class SettingsPage
  extends Lightning.Component<SettingsPageTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SettingsPageTemplateSpec>
{
  buttonIndex = 0;

  static override _template() {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT,
      color: COLOURS.BLACK,
      rect: true,
      Content: {
        MainColumn: {
          LanguageButton: {
            x: SCREEN_SIZES.WIDTH * 0.25,
            y: SCREEN_SIZES.HEIGHT * 0.4,
            mount: 0.5,
            type: SettingsButton,
            ref: "LANG",
            buttonText: "Language",
            signals: {
              toggleLanguages: true,
              toggleParcon: true,
            },
          },
          ParconButton: {
            x: SCREEN_SIZES.WIDTH * 0.25,
            y: SCREEN_SIZES.HEIGHT * 0.6,
            mount: 0.5,
            type: SettingsButton,
            ref: "PARCON",
            buttonText: "Parcon",
            signals: {
              toggleLanguages: true,
              toggleParcon: true,
              showPinOverlayForParcon: true,
              focusSettingsPageParconButton: true,
            },
          },
        },
        OptionsColumn: {
          LanguageOptions: {
            visible: false,
            x: SCREEN_SIZES.WIDTH * 0.75,
            y: SCREEN_SIZES.HEIGHT * 0.5,
            type: SettingsColumn,
            w: 280,
            h: 480,
            mount: 0.5,
          },
          ParconOptions: {
            visible: false,
            x: SCREEN_SIZES.WIDTH * 0.75,
            y: SCREEN_SIZES.HEIGHT * 0.5,
            w: 280,
            h: 360,
            mount: 0.5,
            type: SettingsColumn,
          },
        },
        Line: {
          x: SCREEN_SIZES.WIDTH * 0.5,
          w: 1,
          h: SCREEN_SIZES.HEIGHT,
          rect: true,
          color: COLOURS.GREY,
          zIndex: 1,
        },
        PinOverlay: {
          type: PinOverlay,
          visible: false,
          signals: {
            focusSettingsPageParconButton: true,
          },
        },
      },
    };
  }

  get Content() {
    return this.tag("Content")!;
  }

  get MainColumn() {
    return this.Content.tag("MainColumn")!;
  }

  get LanguageButton() {
    return this.MainColumn.tag("LanguageButton")!;
  }

  get ParconButton() {
    return this.MainColumn.tag("ParconButton")!;
  }

  get OptionsColumn() {
    return this.Content.tag("OptionsColumn")!;
  }

  get LanguageOptions() {
    return this.OptionsColumn.tag("LanguageOptions")!;
  }

  get ParconOptions() {
    return this.OptionsColumn.tag("ParconOptions")!;
  }

  get PinOverlay() {
    return this.Content.tag("PinOverlay")!;
  }

  toggleLanguages(visible: boolean) {
    this.LanguageOptions.patch({ visible });
  }

  toggleParcon(visible: boolean) {
    this.ParconOptions.patch({ visible });
  }

  updateLanguages() {
    this.LanguageOptions.items = [...LANGUAGE_OPTIONS];
  }

  updateParcon() {
    this.ParconOptions.items = [...PARCON_OPTIONS];
  }

  getOptionIndexByRef(options: { label: string; ref: string }[], ref: string): number {
    return options.findIndex((option) => option.ref === ref);
  }

  focusSettingsPageParconButton() {
    this.buttonIndex = 1;
    this._setState("MainColumn");
  }

  setInitialFocus() {
    const lang: string = localStorage.getItem("lang") ?? "";
    const parcon: string = localStorage.getItem("parcon") ?? "";

    if (lang) {
      const langIndex = this.getOptionIndexByRef(LANGUAGE_OPTIONS, lang.replace(/"/g, ""));
      if (langIndex !== -1) {
        this.buttonIndex = 0;
        this._setState("LanguageOptions");
        this.LanguageOptions.children[langIndex]?.patch({
          Label: {
            text: {
              textColor: COLOURS.ORANGE,
            },
          },
        });
      }
    }

    if (parcon) {
      const parconIndex = this.getOptionIndexByRef(PARCON_OPTIONS, parcon.replace(/"/g, ""));
      if (parconIndex !== -1) {
        this.buttonIndex = 1;
        this._setState("ParconOptions");
        this.ParconOptions.children[parconIndex]?.patch({
          Label: {
            text: {
              textColor: COLOURS.ORANGE,
            },
          },
        });
      }
    }
  }

  override _init() {
    eventBus.on("showPinOverlayForParcon", (event: CustomEvent) =>
      this.showPinOverlayForParcon(event),
    );
    eventBus.on("focusMainColumn", () => this._setState("MainColumn"));

    this.updateLanguages();
    this.updateParcon();
    this.setInitialFocus();
    this._setState("MainColumn");
  }

  override _enable() {
    if (this.PinOverlay.visible) {
      this.PinOverlay.patch({
        visible: false,
      });
    }

    Router.focusPage();
  }
  showPinOverlayForParcon(event: CustomEvent) {
    if (!event.detail) {
      console.error("Event detail is undefined");
      return;
    }

    this.PinOverlay.patch({
      visible: true,
      zIndex: 2,
    });

    this.PinOverlay.showPinOverlayForParcon(event);
    this._setState("PinOverlayFocus");
  }

  override _handleBack() {
    Router.navigate("home");
    this._setState("MainColumn");
    eventBus.emit("setStateOnDetailButton", {});
  }

  override _handleKey(event: { keyCode: number }) {
    const key = getPressedKey(event.keyCode);

    if (key === undefined) {
      return;
    }

    switch (key) {
      case KEYS.VK_BACK:
        this._handleBack();
        break;
      case KEYS.VK_LEFT:
        this._setState("MainColumn");
        break;
    }
  }

  static override _states() {
    return [
      class MainColumn extends this {
        override _getFocused(): SettingsButton {
          return this.MainColumn.children[this.buttonIndex] as SettingsButton;
        }

        override _handleKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_UP:
              this.buttonIndex = 0;
              break;
            case KEYS.VK_DOWN:
              this.buttonIndex = 1;
              break;
            case KEYS.VK_RIGHT:
              if (this.buttonIndex === 0) {
                this._setState("LanguageOptions");
              } else if (this.buttonIndex === 1) {
                this._setState("ParconOptions");
              }
              break;
            case KEYS.VK_LEFT:
              Router.focusWidget("Sidebar");
              break;
          }
        }
      },
      class LanguageOptions extends this {
        override _getFocused(): SettingsColumn {
          return this.LanguageOptions;
        }
      },
      class ParconOptions extends this {
        override _getFocused(): SettingsColumn {
          return this.ParconOptions;
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
      class ParconButton extends this {
        override _getFocused(): SettingsButton {
          return this.ParconButton;
        }
      },
    ];
  }
}
