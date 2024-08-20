import { Lightning, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { Player } from "./Player";
import { PlayerUIButton } from "./Button";
import { KEYS } from "../../static/constants/Keys";
import { getPressedKey } from "../../static/constants/Keys";

// useful constants
const timeY = 810;
const font = "Bold";

interface PlayerUITemplateSpec extends Lightning.Component.TemplateSpec {
  Background: object;
  PlayBackButtons: {
    PreviousButton: typeof PlayerUIButton;
    BkwSkipButton: typeof PlayerUIButton;
    PlayButton: typeof PlayerUIButton;
    FwdSkipButton: typeof PlayerUIButton;
    NextButton: typeof PlayerUIButton;
  };
  ProgressBar: {
    Frame: object;
    Troth: object;
  };
  Runtime: object;
  CurrentTime: object;
  TitleWrapper: {
    Title: object;
    Release: object;
  };
}

export class PlayerUI
  extends Lightning.Component<PlayerUITemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<PlayerUITemplateSpec>
{
  defaultAnimationDuration = 0.5;
  playIconShowing = false;

  private playerInstance?: Player;
  private progressBarInterval?: number;

  private hideUITimerID?: number;
  private readonly hideUIDelay = 5000;

  // animations for show
  private playBtnShowAnimation: any;
  private prevBtnShowAnimation: any;
  private nextBtnShowAnimation: any;
  private bkwSkipBtnShowAnimation: any;
  private fwdSkipBtnShowAnimation: any;
  private progressBarShowAnimation: any;
  private backgroundShowAnimation: any;
  private runtimeShowAnimation: any;
  private currentTimeShowAnimation: any;
  private titleWrapperShowAnimation: any;

  // animations for hide
  private playBtnHideAnimation: any;
  private prevBtnHideAnimation: any;
  private nextBtnHideAnimation: any;
  private bkwSkipBtnHideAnimation: any;
  private fwdSkipBtnHideAnimation: any;
  private progressBarHideAnimation: any;
  private backgroundHideAnimation: any;
  private runtimeHideAnimation: any;
  private currentTimeHideAnimation: any;
  private titleWrapperHideAnimation: any;

  static override _template(): Lightning.Component.Template<PlayerUITemplateSpec> {
    return {
      Background: {
        rect: true,
        color: COLOURS.BLACK,
        w: SCREEN_SIZES.WIDTH,
        h: SCREEN_SIZES.HEIGHT,
        alpha: 0.5,
      },
      PlayBackButtons: {
        PreviousButton: {
          type: PlayerUIButton,
          signals: {
            prevPressed: true,
          },
        },
        BkwSkipButton: {
          type: PlayerUIButton,
          signals: {
            skipBackwardPressed: true,
          },
        },
        PlayButton: {
          type: PlayerUIButton,
          signals: {
            playPressed: true,
          },
        },
        FwdSkipButton: {
          type: PlayerUIButton,
          signals: {
            skipForwardPressed: true,
          },
        },
        NextButton: {
          type: PlayerUIButton,
          signals: {
            nextPressed: true,
          },
        },
      },
      ProgressBar: {
        alpha: 1,
        y: 830,
        x: 970,
        w: 1620,
        h: 8,
        mountX: 0.5,
        Frame: {
          w: (w) => w,
          h: (h) => h,
          rect: true,
          alpha: 0.7,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 2 },
        },
        Troth: {
          mountY: 0.5,
          y: 4,
          x: -10,
          w: 20,
          h: 20,
          rect: true,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        },
      },
      Runtime: {
        alpha: 1,
        y: timeY,
        x: SCREEN_SIZES.WIDTH - 120,
        w: 200,
        h: 50,
        text: {
          fontFace: font,
          fontSize: 35,
        },
      },
      CurrentTime: {
        alpha: 1,
        y: timeY,
        x: 10,
        w: 200,
        h: 50,
        text: {
          fontFace: font,
          fontSize: 35,
        },
      },
      TitleWrapper: {
        Title: {
          alpha: 1,
          x: 230,
          y: 90,
          w: 1060,
          text: {
            fontFace: font,
            fontSize: 74,
          },
        },
        Release: {
          alpha: 1,
          x: 230,
          y: 250,
          w: 1060,
          text: {
            fontFace: font,
            fontSize: 40,
          },
        },
      },
    };
  }

  resetUITimer() {
    if (this.hideUITimerID) {
      clearTimeout(this.hideUITimerID);
    }
    this.hideUITimerID = setTimeout(() => {
      if (!this.playIconShowing) {
        this.hideUI();
        this.signal("changeStateToPlayerState", this);
      }
    }, this.hideUIDelay);
  }

  get PreviousButton() {
    return this.tag("PlayBackButtons.PreviousButton");
  }

  get BkwSkipButton() {
    return this.tag("PlayBackButtons.BkwSkipButton");
  }

  get PlayButton() {
    return this.tag("PlayBackButtons.PlayButton");
  }

  get FwdSkipButton() {
    return this.tag("PlayBackButtons.FwdSkipButton");
  }

  get NextButton() {
    return this.tag("PlayBackButtons.NextButton");
  }

  get Background() {
    return this.tag("Background");
  }

  get Title() {
    return this.tag("TitleWrapper.Title");
  }

  get ProgressBar() {
    return this.tag("ProgressBar");
  }

  get Troth() {
    return this.tag("ProgressBar.Troth");
  }

  get Runtime() {
    return this.tag("Runtime");
  }

  get CurrentTime() {
    return this.tag("CurrentTime");
  }

  get Release() {
    return this.tag("TitleWrapper.Release");
  }

  get TitleWrapper() {
    return this.tag("TitleWrapper");
  }

  private convertMinutesToHMS(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    const seconds = Math.floor((minutes % 1) * 60);

    return `${hours}:${remainingMinutes < 10 ? "0" : ""}${remainingMinutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  }

  private convertSecondsToHMS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  setMovieDetails(title: string, releaseDate: string, runtime: number) {
    const formattedRuntime = this.convertMinutesToHMS(runtime);

    this.Title?.patch({
      text: `${title}`,
    });
    this.Release?.patch({
      text: `Release: ${releaseDate}`,
    });
    this.Runtime?.patch({
      text: `${formattedRuntime}`,
    });
  }

  override _active() {
    this.setupButtons();
    this.setupShowAnimations();
    this.setupHideAnimations();
    this.resetUITimer();
  }

  override _detach() {
    this.clearProgressBarInterval();
    super._detach();
  }

  setPlayerInstance(playerInstance: Player) {
    this.playerInstance = playerInstance;
    this.clearProgressBarInterval();
    this.startProgressBarUpdate();
  }

  clearProgressBarInterval() {
    if (this.progressBarInterval) {
      clearInterval(this.progressBarInterval);
      this.progressBarInterval = undefined;
    }
  }

  startProgressBarUpdate() {
    this.progressBarInterval = setInterval(() => {
      if (this.playerInstance) {
        const currentTime = this.playerInstance.getCurrentTime();
        const duration = this.playerInstance.getDuration();
        const progress = currentTime / duration;
        this.updateProgressBar(progress);
      }
    }, 1);
  }

  updateProgressBar(progress: number) {
    const progressBarWidth = this.ProgressBar?.w;
    if (progressBarWidth !== undefined) {
      const newTrothW = progressBarWidth * progress + 20;
      this.Troth!.w = newTrothW;
      this.CurrentTime?.patch({
        text: this.convertSecondsToHMS(this.playerInstance?.getCurrentTime().toFixed(0)),
      });
    }
  }

  setupButtons() {
    const buttonWidth = 100;
    const buttonHeight = 100;
    const gap = 50;
    const totalButtons = 5;
    const totalWidth = buttonWidth * totalButtons + gap * (totalButtons - 1);
    const centerX = SCREEN_SIZES.WIDTH / 2;

    const startX = centerX - totalWidth / 2;

    this.PreviousButton?.patch({
      src: Utils.asset("images/logos/previous.png"),
      buttonText: "",
      x: startX,
      y: 900,
      w: buttonWidth,
      h: buttonHeight,
    });

    this.BkwSkipButton?.patch({
      src: Utils.asset("images/logos/backward.png"),
      buttonText: "",
      x: startX + buttonWidth + gap,
      y: 900,
      w: buttonWidth,
      h: buttonHeight,
    });

    this.PlayButton?.patch({
      src: Utils.asset("images/logos/pause.png"),
      buttonText: "",
      x: startX + 2 * (buttonWidth + gap),
      y: 900,
      w: buttonWidth,
      h: buttonHeight,
    });

    this.FwdSkipButton?.patch({
      src: Utils.asset("images/logos/forward.png"),
      buttonText: "",
      x: startX + 3 * (buttonWidth + gap),
      y: 900,
      w: buttonWidth,
      h: buttonHeight,
    });

    this.NextButton?.patch({
      src: Utils.asset("images/logos/next.png"),
      buttonText: "",
      x: startX + 4 * (buttonWidth + gap),
      y: 900,
      w: buttonWidth,
      h: buttonHeight,
    });
  }

  createButtonAnimationForShow(button: Lightning.Component | undefined) {
    return button?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "y",
          v: { 0: SCREEN_SIZES.HEIGHT + 100, 1: 900 },
        },
      ],
    });
  }

  setupShowAnimations() {
    this.playBtnShowAnimation = this.createButtonAnimationForShow(this.PlayButton);
    this.prevBtnShowAnimation = this.createButtonAnimationForShow(this.PreviousButton);
    this.nextBtnShowAnimation = this.createButtonAnimationForShow(this.NextButton);
    this.bkwSkipBtnShowAnimation = this.createButtonAnimationForShow(this.BkwSkipButton);
    this.fwdSkipBtnShowAnimation = this.createButtonAnimationForShow(this.FwdSkipButton);

    this.progressBarShowAnimation = this.ProgressBar?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "y",
          v: { 0: SCREEN_SIZES.HEIGHT + 100, 1: 830 },
        },
      ],
    });

    this.backgroundShowAnimation = this.Background?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 0.5 },
        },
      ],
    });

    this.runtimeShowAnimation = this.Runtime?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "y",
          v: { 0: SCREEN_SIZES.HEIGHT + 100, 1: timeY },
        },
      ],
    });

    this.currentTimeShowAnimation = this.CurrentTime?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "y",
          v: { 0: SCREEN_SIZES.HEIGHT + 100, 1: timeY },
        },
      ],
    });

    this.titleWrapperShowAnimation = this.TitleWrapper?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0, 1: 1 },
        },
        {
          p: "y",
          v: { 0: -100, 1: 90 },
        },
      ],
    });
  }

  showUI() {
    this.progressBarShowAnimation?.start();
    this.playBtnShowAnimation?.start();
    this.prevBtnShowAnimation?.start();
    this.nextBtnShowAnimation?.start();
    this.backgroundShowAnimation?.start();
    this.titleWrapperShowAnimation?.start();
    this.bkwSkipBtnShowAnimation?.start();
    this.fwdSkipBtnShowAnimation?.start();
    this.runtimeShowAnimation?.start();
    this.currentTimeShowAnimation?.start();

    this.resetUITimer();
  }

  createButtonAnimationForHide(button: Lightning.Component | undefined) {
    return button?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 1, 1: 0 },
        },
        {
          p: "y",
          v: { 0: 900, 1: SCREEN_SIZES.HEIGHT + 100 },
        },
      ],
    });
  }

  setupHideAnimations() {
    this.playBtnHideAnimation = this.createButtonAnimationForHide(this.PlayButton);
    this.prevBtnHideAnimation = this.createButtonAnimationForHide(this.PreviousButton);
    this.nextBtnHideAnimation = this.createButtonAnimationForHide(this.NextButton);
    this.bkwSkipBtnHideAnimation = this.createButtonAnimationForHide(this.BkwSkipButton);
    this.fwdSkipBtnHideAnimation = this.createButtonAnimationForHide(this.FwdSkipButton);

    this.backgroundHideAnimation = this.Background?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 0.5, 1: 0 },
        },
      ],
    });

    this.progressBarHideAnimation = this.ProgressBar?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 1, 1: 0 },
        },
        {
          p: "y",
          v: { 0: 830, 1: SCREEN_SIZES.HEIGHT + 100 },
        },
      ],
    });

    this.runtimeHideAnimation = this.Runtime?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 1, 1: 0 },
        },
        {
          p: "y",
          v: { 0: timeY, 1: SCREEN_SIZES.HEIGHT + 100 },
        },
      ],
    });

    this.currentTimeHideAnimation = this.CurrentTime?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 1, 1: 0 },
        },
        {
          p: "y",
          v: { 0: timeY, 1: SCREEN_SIZES.HEIGHT + 100 },
        },
      ],
    });

    this.titleWrapperHideAnimation = this.TitleWrapper?.animation({
      duration: this.defaultAnimationDuration,
      repeat: 0,
      actions: [
        {
          p: "alpha",
          v: { 0: 1, 1: 0 },
        },
        {
          p: "y",
          v: { 0: 90, 1: -100 },
        },
      ],
    });
  }

  hideUI() {
    this.playBtnHideAnimation?.start();
    this.prevBtnHideAnimation?.start();
    this.nextBtnHideAnimation?.start();
    this.bkwSkipBtnHideAnimation?.start();
    this.fwdSkipBtnHideAnimation?.start();
    this.backgroundHideAnimation?.start();
    this.progressBarHideAnimation?.start();
    this.runtimeHideAnimation?.start();
    this.currentTimeHideAnimation?.start();
    this.titleWrapperHideAnimation?.start();
  }

  override _focus() {
    this.showUI();
    this._setState("PlayButton");
  }

  override _unfocus() {
    this.hideUI();
  }

  override _handleBack() {
    this._unfocus();
    this.signal("changeStateToPlayerState", this);
  }

  static override _states() {
    return [
      class PreviousButton extends this {
        override _getFocused() {
          return this.PreviousButton;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_RIGHT:
              this._setState("BkwSkipButton");
              this.resetUITimer();
              break;
            case KEYS.VK_ENTER:
              this.signal("prevPressed", this);
              this.resetUITimer();
              break;
          }
        }
      },

      class BkwSkipButton extends this {
        override _getFocused() {
          return this.BkwSkipButton;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_LEFT:
              this._setState("PreviousButton");
              this.resetUITimer();
              break;
            case KEYS.VK_RIGHT:
              this._setState("PlayButton");
              this.resetUITimer();
              break;
            case KEYS.VK_ENTER:
              this.signal("skipBackwardPressed", this);
              this.resetUITimer();
              break;
          }
        }
      },

      class PlayButton extends this {
        override _getFocused() {
          return this.PlayButton;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_LEFT:
              this._setState("BkwSkipButton");
              this.resetUITimer();
              break;
            case KEYS.VK_RIGHT:
              this._setState("FwdSkipButton");
              this.resetUITimer();
              break;
            case KEYS.VK_ENTER:
              if (!this.playIconShowing) {
                this.PlayButton?.patch({
                  src: Utils.asset("images/logos/play.png"),
                });

                this.playIconShowing = true;
              } else {
                this.PlayButton?.patch({
                  src: Utils.asset("images/logos/pause.png"),
                });

                this.resetUITimer();
                this.playIconShowing = false;
              }

              this.signal("playPressed", this);
              break;
          }
        }
      },

      class FwdSkipButton extends this {
        override _getFocused() {
          return this.FwdSkipButton;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_LEFT:
              this._setState("PlayButton");
              this.resetUITimer();
              break;
            case KEYS.VK_RIGHT:
              this._setState("NextButton");
              this.resetUITimer();
              break;
            case KEYS.VK_ENTER:
              this.signal("skipForwardPressed", this);
              this.resetUITimer();
              break;
          }
        }
      },

      class NextButton extends this {
        override _getFocused() {
          return this.NextButton;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this._handleBack();
              break;
            case KEYS.VK_LEFT:
              this._setState("FwdSkipButton");
              this.resetUITimer();
              break;
            case KEYS.VK_ENTER:
              this.signal("nextPressed", this);
              this.resetUITimer();
              break;
          }
        }
      },
    ];
  }

  // could be useful later
  updatePlayButtonToPause() {
    this.PlayButton?.patch({
      src: Utils.asset("images/logos/pause.png"),
    });

    this.playIconShowing = false;
  }

  updatePlayButtonToPlay() {
    this.PlayButton?.patch({
      src: Utils.asset("images/logos/play.png"),
    });

    this.playIconShowing = true;
  }
}
