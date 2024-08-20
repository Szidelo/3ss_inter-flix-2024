import { Lightning, Router } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import BlackBox from "./BlackBox";
import Keyboard from "./KeyBoard";
import eventBus from "./EventBus";
import KEYS, { getPressedKey } from "../../static/constants/Keys";

type PinKeys =
  | "PinOverlay.Overlay.Pin0"
  | "PinOverlay.Overlay.Pin1"
  | "PinOverlay.Overlay.Pin2"
  | "PinOverlay.Overlay.Pin3";

enum PromptStates {
  EnterPin = "Enter PIN",
  EnterPreviousPin = "Enter Previous Pin",
  EnterNewPin = "Enter New Pin",
  SetPin = "Set Pin",
  EnterPinToTurnOffParcon = "Enter Pin to turn off Parcon",
}

export interface PinOverlayTemplateSpec extends Lightning.Component.TemplateSpec {
  PinOverlay: {
    Text: object;
    Overlay: {
      Pin0: typeof BlackBox;
      Pin1: typeof BlackBox;
      Pin2: typeof BlackBox;
      Pin3: typeof BlackBox;
    };
    Attempts: object;
  };
  Keyboard: typeof Keyboard;
}

export class PinOverlay extends Lightning.Component<PinOverlayTemplateSpec> {
  pin: string[] = ["", "", "", ""];
  movieId = 0;
  currentPinIndex = 0;
  attemptsLeft = 3;
  promptText = PromptStates.EnterPin;
  showAttempts = true;
  _isMovie = false;

  static override _template(): Lightning.Component.Template<PinOverlayTemplateSpec> {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT,
      rect: true,
      color: COLOURS.BLACK,
      PinOverlay: {
        w: 800,
        h: 500,
        rect: true,
        color: COLOURS.GREY,
        mountX: 0.5,
        mountY: 0.5,
        x: 960,
        y: 540,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 20,
        },
        Text: {
          x: 400,
          y: 100,
          mountX: 0.5,
          mountY: 0.5,
          text: {
            text: PromptStates.EnterPin,
            fontSize: 48,
            textColor: 0xffffffff,
          },
        },
        Overlay: {
          x: 400,
          y: 250,
          mountX: 0.5,
          mountY: 0.5,
          w: 600,
          h: 150,
          rect: true,
          color: 0xff666666,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 20,
          },
          flex: {
            direction: "row",
            alignItems: "center",
            justifyContent: "space-around",
          },
          Pin0: { type: BlackBox },
          Pin1: { type: BlackBox },
          Pin2: { type: BlackBox },
          Pin3: { type: BlackBox },
        },
        Attempts: {
          x: 400,
          y: 400,
          mountX: 0.5,
          mountY: 0.5,
          text: {
            text: "Attempts left: 3",
            fontSize: 48,
            textColor: 0xffffffff,
          },
        },
      },
      Keyboard: {
        type: Keyboard,
        mountX: 0.5,
        x: 960,
        y: 860,
        w: 630,
        h: 180,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 20,
        },
        signals: {
          onKeyPress: true,
        },
      },
    };
  }

  override _init() {
    eventBus.on("showPinOverlay", (event) => this.showPinOverlay(event as CustomEvent));
    eventBus.on("showPinOverlayForParcon", (event) =>
      this.showPinOverlayForParcon(event as CustomEvent),
    );
  }

  get PinOverlay() {
    return this.tag("PinOverlay");
  }

  get KeyBoard() {
    return this.tag("Keyboard");
  }

  static override _states() {
    return [
      class KeyboardFocus extends this {
        override $enter() {
          this.KeyBoard?._setIndex(0);
          this._highlightText();
          this._highlightKey();
        }

        _highlightText() {
          const pinOverlayText = this.PinOverlay?.tag("Text");
          if (pinOverlayText && pinOverlayText.text) {
            pinOverlayText.text.textColor = COLOURS.ORANGE;
          }
        }

        _highlightKey() {
          const currentKeyComponent = this.KeyBoard?._getCurrentKey();
          if (currentKeyComponent) {
            currentKeyComponent.patch({ backgroundColor: 0xff333333 });
          }
        }

        override _handleUp() {
          if (this.KeyBoard?._rowIndex === 0) {
            this._setState("PinOverlayFocus");
          } else if (this.KeyBoard?._rowIndex === 1) {
            this.KeyBoard.focusUp();
          }
        }

        override _handleDown() {
          this.KeyBoard?.focusDown();
        }

        override _handleLeft() {
          this.KeyBoard?.focusPrevious();
        }

        override _handleRight() {
          this.KeyBoard?.focusNext();
        }

        override _handleEnter() {
          const key = this.KeyBoard?.triggerEnter();
          if (key) {
            if ((key <= "9" && key >= "0") || key === "DEL") {
              this.onKeyPress(key);
            } else if (key === "OK") {
              super._handleEnter();
            }
          }
        }
      },
      class PinOverlayFocus extends this {
        override _focus() {
          const pinOverlayText = this.PinOverlay?.tag("Text");
          if (pinOverlayText && pinOverlayText.text) {
            pinOverlayText.text.textColor = COLOURS.ORANGE;
          }
        }

        override _handleDown() {
          const pinOverlayText = this.PinOverlay?.tag("Text");
          if (pinOverlayText && pinOverlayText.text) {
            pinOverlayText.text.textColor = COLOURS.WHITE;
          }
          this._setState("KeyboardFocus");
        }

        override _handleEnter() {
          if (this.pin.filter((p) => p !== "").length === 4) {
            const enteredPin = this.pin.join("");
            const storedPin = localStorage.getItem("password");

            console.log(storedPin, enteredPin);

            if (!storedPin) {
              localStorage.setItem("password", enteredPin);
              eventBus.emit("pinSet", { pin: enteredPin });
              this.hidePinOverlay();
              this.signal("focusSettingsPageParconButton", this);
            } else if (
              enteredPin === storedPin &&
              Router.getActiveRoute() === "settings" &&
              this.promptText === PromptStates.EnterPreviousPin
            ) {
              eventBus.emit("pinCorrect");
              this.hidePinOverlay();
              eventBus.emit("showPinOverlayForParcon", {
                promptText: PromptStates.EnterNewPin,
                showAttempts: false,
              });
              this.promptText = PromptStates.EnterNewPin;
              this.resetPinOverlay();
            } else if (
              enteredPin === storedPin &&
              (Router.getActiveRoute() === "home" ||
                Router.getActiveRoute()?.startsWith("movie") ||
                Router.getActiveRoute() === "search")
            ) {
              eventBus.emit("pinCorrect");
              this.hidePinOverlay();
              if (this._isMovie) {
                Router.navigate(`movie/${this.movieId}`);
              } else {
                Router.navigate(`tvshow/${this.movieId}`);
              }
            } else if (
              this.promptText === PromptStates.EnterNewPin &&
              Router.getActiveRoute() === "settings"
            ) {
              localStorage.setItem("password", enteredPin);
              eventBus.emit("pinSet", { pin: enteredPin });
              this.hidePinOverlay();
              this.signal("focusSettingsPageParconButton", this);
            } else if (
              enteredPin === storedPin &&
              this.promptText === PromptStates.EnterPinToTurnOffParcon &&
              Router.getActiveRoute() === "settings"
            ) {
              eventBus.emit("pinCorrect");
              this.hidePinOverlay();
              localStorage.removeItem("password");
              localStorage.setItem("parcon", "OFF");
              this.signal("focusSettingsPageParconButton", this);
            } else {
              this.attemptsLeft--;
              this.tag("PinOverlay.Attempts")?.patch({
                text: {
                  text: `Attempts left: ${this.attemptsLeft}`,
                  fontSize: 48,
                },
              });

              if (
                this.attemptsLeft <= 0 &&
                (Router.getActiveRoute() === "home" ||
                  Router.getActiveRoute()?.startsWith("movie") ||
                  Router.getActiveRoute() === "search")
              ) {
                eventBus.emit("accessDenied");
                this.hidePinOverlay();
                eventBus.emit("setStateOnDetailButton", {});
                setTimeout(() => {
                  eventBus.emit("focusCard", { movieId: this.movieId });
                }, 0);
              } else if (this.attemptsLeft <= 0 && Router.getActiveRoute() === "settings") {
                eventBus.emit("accessDenied");
                this.hidePinOverlay();
                Router.navigate("settings");
                eventBus.emit("focusMainColumn", {});

                setTimeout(() => {
                  eventBus.emit("focusCard", { movieId: this.movieId });
                }, 0);
              }
            }
          } else {
            console.log("PIN must be 4 digits long");
          }
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              if (
                this.pin.filter((p) => p !== "").length === 0 &&
                Router.getActiveRoute() === "home"
              ) {
                this.hidePinOverlay();
                Router.navigate("home");
                eventBus.emit("setStateOnDetailButton", {});
              } else if (
                this.pin.filter((p) => p !== "").length === 0 &&
                Router.getActiveRoute() === "settings"
              ) {
                this.hidePinOverlay();
                Router.navigate("settings");
                eventBus.emit("focusMainColumn", {});
              } else if (
                this.pin.filter((p) => p !== "").length === 0 &&
                Router.getActiveRoute()?.startsWith("movie")
              ) {
                this.hidePinOverlay();
                eventBus.emit("setStateOnDetailButton", {});
              } else {
                this.removeLastPin();
                this.KeyBoard?.setKey("DEL");
              }

              break;
            case KEYS.VK_ENTER:
              this._handleEnter();
              this.KeyBoard?.setKey("OK");
              break;
            case KEYS.VK_DOWN:
              this._handleDown();
              break;
            default:
              this.handleNumericKeys(key);
              break;
          }
        }

        handleNumericKeys(key: KEYS) {
          if (this.currentPinIndex < 4 && key >= KEYS.VK_0 && key <= KEYS.VK_9) {
            this.updatePin(key.replace("VK_", ""));
            this.KeyBoard?.setKey(key.replace("VK_", ""));
          }
        }
      },
    ];
  }

  updatePromptText(text: PromptStates) {
    this.promptText = text;
    this.tag("PinOverlay.Text")?.patch({
      text: { text: this.promptText },
    });
  }

  showPinOverlay(event: CustomEvent) {
    this.movieId = event.detail.movieId;
    this._isMovie = event.detail.isMovie;
    this.updatePromptText(PromptStates.EnterPin);
    this.showAttempts = true;
    this.resetPinOverlay();
    this.patch({
      visible: true,
      zIndex: 2,
      PinOverlay: {
        Attempts: {
          visible: this.showAttempts,
        },
      },
    });
    this._setState("PinOverlayFocus");
  }
  showPinOverlayForParcon(event: CustomEvent) {
    const { promptText, showAttempts } = event.detail;
    this.updatePromptText(promptText || PromptStates.EnterPin);
    this.showAttempts = showAttempts !== undefined ? showAttempts : true;
    this.resetPinOverlay();
    this.patch({
      visible: true,
      zIndex: 2,
      PinOverlay: {
        Attempts: {
          visible: this.showAttempts,
        },
      },
    });
    this._setState("PinOverlayFocus");
  }

  resetPinOverlay() {
    this.pin = ["", "", "", ""];
    this.currentPinIndex = 0;
    this.attemptsLeft = 3;
    this.updatePinBoxes();
    this.tag("PinOverlay.Attempts")?.patch({
      text: { text: `Attempts left: ${this.attemptsLeft}`, fontSize: 48 },
    });
  }

  updatePin(digit: string) {
    if (this.currentPinIndex < 4) {
      this.pin[this.currentPinIndex] = digit;
      const pinKey = `PinOverlay.Overlay.Pin${this.currentPinIndex}` as PinKeys;
      const pinBox = this.tag(pinKey);
      pinBox?.patch({ text: { text: digit } });
      this.currentPinIndex++;
      this.updateFocus();
    }
  }

  removeLastPin() {
    if (this.currentPinIndex > 0) {
      this.currentPinIndex--;
      this.pin[this.currentPinIndex] = "";
      const pinKey = `PinOverlay.Overlay.Pin${this.currentPinIndex}` as PinKeys;
      const pinBox = this.tag(pinKey);
      pinBox?.patch({ text: { text: "" } });
      this.updateFocus();
    }
  }

  updateFocus() {
    for (let i = 0; i < 4; i++) {
      const pinKey = `PinOverlay.Overlay.Pin${i}` as PinKeys;
      this.tag(pinKey)?.patch({
        color: i === this.currentPinIndex ? 0xffffffff : 0xff333333,
      });
    }
  }

  updatePinBoxes() {
    for (let i = 0; i < 4; i++) {
      const pinKey = `PinOverlay.Overlay.Pin${i}` as PinKeys;
      this.tag(pinKey)?.patch({ text: { text: "" } });
    }
  }

  override _handleEnter() {
    if (this.pin.filter((p) => p !== "").length === 4) {
      const enteredPin = this.pin.join("");
      const storedPin = localStorage.getItem("password");

      if (enteredPin === storedPin) {
        eventBus.emit("pinCorrect");

        if (this._isMovie) {
          Router.navigate(`movie/${this.movieId}`);
        } else {
          Router.navigate(`tvshow/${this.movieId}`);
        }
      } else {
        this.attemptsLeft--;
        this.tag("PinOverlay.Attempts")?.patch({
          text: { text: `Attempts left: ${this.attemptsLeft}`, fontSize: 48 },
        });

        if (this.attemptsLeft <= 0) {
          eventBus.emit("accessDenied");
          this.hidePinOverlay();
          Router.navigate("home");
          setTimeout(() => {
            eventBus.emit("focusCard", { movieId: this.movieId });
          }, 0);
        }
      }
    } else {
      console.log("PIN must be 4 digits long");
    }
  }

  hidePinOverlay() {
    this.patch({
      visible: false,
    });

    this._setState("");

    eventBus.emit("focusMainColumn");
  }

  onKeyPress(key: string) {
    if (key >= "0" && key <= "9") {
      this.updatePin(key);
    } else if (key === "DEL") {
      this.removeLastPin();
    } else if (key === "OK") {
      this._handleEnter();
    }
  }
}

export default PinOverlay;
