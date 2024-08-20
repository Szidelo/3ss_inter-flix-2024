import { Lightning, Router } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { Player } from "../components/Player";
import { PlayerUI } from "../components/PlayerUI";
import { movieService } from "../utils/service/MovieService";
import { KEYS } from "../../static/constants/Keys";
import { getPressedKey } from "../../static/constants/Keys";

interface PlayerPageTemplateSpec extends Lightning.Component.TemplateSpec {
  Background: object;
  Player: typeof Player;
  PlayerUI: typeof PlayerUI;
}

export class PlayerPage
  extends Lightning.Component<PlayerPageTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<PlayerPageTemplateSpec>
{
  private defaultSkipSeconds = 15;
  private movieID!: number;

  private workingURLs = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  ];

  static override _template(): Lightning.Component.Template<PlayerPageTemplateSpec> {
    return {
      Background: {
        w: SCREEN_SIZES.WIDTH,
        h: SCREEN_SIZES.HEIGHT,
        color: COLOURS.BLACK,
        zIndex: 0,
      },
      Player: {
        type: Player,
        zIndex: 1,
      },
      PlayerUI: {
        zIndex: 2,
        type: PlayerUI,
        signals: {
          playPressed: true,
          changeStateToPlayerState: true,
          prevPressed: true,
          skipBackwardPressed: true,
          skipForwardPressed: true,
          nextPressed: true,
        },
      },
    };
  }

  get PlayerUI() {
    return this.tag("PlayerUI");
  }

  private getRandomURLIndex(): number {
    const randomIndex = Math.floor(Math.random() * this.workingURLs.length);
    return randomIndex;
  }

  override set params(param: any) {
    this.movieID = Number(param.id);
  }

  async fetchMovieDetails() {
    const movieDetails = await movieService.getMovieDetails(this.movieID);

    if (movieDetails) {
      this.PlayerUI?.setMovieDetails(
        movieDetails.title,
        movieDetails.release_date,
        movieDetails.runtime,
      );
    }
  }

  override _active() {
    const index = this.getRandomURLIndex();
    const url = this.workingURLs[index];
    url ? this.Player?.initializePlayback(url) : null;

    this.PlayerUI?.setPlayerInstance(this.Player!);

    this.fetchMovieDetails();

    this._setState("PlayerUIState");
  }

  get Player() {
    return this.tag("Player");
  }

  static override _states() {
    return [
      class PlayerState extends this {
        override _getFocused() {
          return this.Player;
        }

        override _captureKey(event: { keyCode: number }) {
          const key = getPressedKey(event.keyCode);

          if (key === undefined) {
            return;
          }

          switch (key) {
            case KEYS.VK_BACK:
              this.Player?.close();
              Router.back();
              break;
            case KEYS.VK_UP:
              this._setState("PlayerUIState");
              break;
            case KEYS.VK_DOWN:
              this._setState("PlayerUIState");
              break;
            case KEYS.VK_ENTER:
              this._setState("PlayerUIState");
              break;
            case KEYS.VK_LEFT:
              this.Player?.skip(-this.defaultSkipSeconds);
              break;
            case KEYS.VK_RIGHT:
              this.Player?.skip(this.defaultSkipSeconds);
              break;
            case KEYS.VK_PLAY:
              // to test on tv
              this.Player?.playPause();
              break;
            case KEYS.VK_PAUSE:
              // to test on tv
              this.Player?.playPause();
              break;
          }
        }
      },
      class PlayerUIState extends this {
        override _getFocused() {
          return this.PlayerUI;
        }

        playPressed() {
          this.Player?.playPause();
        }

        changeStateToPlayerState() {
          this._setState("PlayerState");
        }

        prevPressed() {
          this.Player?.reload();
          if (this.Player?.isPlaying) {
            this.PlayerUI?.updatePlayButtonToPause();
          }
        }

        skipBackwardPressed() {
          this.Player?.skip(-this.defaultSkipSeconds);
        }

        skipForwardPressed() {
          this.Player?.skip(this.defaultSkipSeconds);
        }

        nextPressed() {
          // go to next episode or something (for now it only behaves like prev to avoid bugs)
          this.prevPressed();
        }
      },
    ];
  }
}
