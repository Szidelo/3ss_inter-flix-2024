import { Lightning } from "@lightningjs/sdk";
import { UtilityButton } from "./UtilityButton";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { COLOURS } from "../../static/constants/Colours";
import MovieDetailsOverlay from "./DetailsOverlay";
import { MovieDetailsExtended } from "../utils/interfaces/items/itemsInterface";
import { getAverageARGBFromUrl } from "../utils";
import lng from "@lightningjs/sdk/src/Lightning";
import Router from "@lightningjs/sdk/src/Router";

interface GalleryTemplateSpec extends Lightning.Component.TemplateSpec {
  Gallery: {
    Mask: object;
    Image: {
      texture: {
        src: string;
      };
    };
    Details: {
      TitleLogo: object;
      Title: object;
      Description: object;
      Buttons: {
        TrailerButton: typeof UtilityButton;
        DetailsBtn: typeof UtilityButton;
        MoreDetails: typeof UtilityButton;
      };
    };
    MovieDetailsOverlay: typeof MovieDetailsOverlay;
    signals: {
      $showDetails: true;
      $hideDetails: true;
    };
  };
}

type GalleryProps = {
  logoTitle: string;
  title: string;
  description: string;
  src: string;
  showBtn: boolean;
  showTrailers: boolean;
  isHomePage: boolean;
  id: number;
  isMovie: boolean;
  adult: boolean;
  isCentered: boolean;
};

export class Gallery
  extends Lightning.Component<GalleryTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<GalleryTemplateSpec>
{
  protected _currentImage = "";

  static override _template(): Lightning.Component.Template<GalleryTemplateSpec> {
    return {
      w: SCREEN_SIZES.WIDTH,
      h: SCREEN_SIZES.HEIGHT / 2,
      rect: true,
      zIndex: 0,
      color: COLOURS.RAISIN_BLACK,
      Gallery: {
        Mask: {
          w: SCREEN_SIZES.WIDTH,
          h: SCREEN_SIZES.HEIGHT,
          rect: true,
          color: COLOURS.RAISIN_BLACK,
          shader: { type: Lightning.shaders.FadeOut, fade: [0, 1520, 0, 0] },
          zIndex: 1,
        },
        Image: {
          zIndex: 0,
          alpha: 1,
          texture: {
            resizeMode: {
              type: "cover",
              w: SCREEN_SIZES.WIDTH,
              h: SCREEN_SIZES.HEIGHT,
              clipY: 0,
            },
            type: Lightning.textures.ImageTexture,
          },
        },
        Details: {
          zIndex: 2,
          x: -70,
          y: 0,
          w: SCREEN_SIZES.WIDTH,
          h: SCREEN_SIZES.HEIGHT / 2.2,
          flex: {
            direction: "column",
            paddingLeft: 200,
            paddingBottom: 200,
            justifyContent: "flex-end",
          },
          flexItem: {
            margin: 100,
          },
          TitleLogo: {
            x: 100,
            y: -20,
            texture: {},
            scale: 1,
          },
          Title: {
            text: {
              fontSize: 64,
              fontStyle: "bold",
              textColor: COLOURS.WHITE,
            },
          },
          Description: {
            w: 800,
            text: {
              fontSize: 16,
              lineHeight: 20,
              textColor: COLOURS.WHITE,
            },
          },
          Buttons: {
            w: 430,
            flex: {
              direction: "row",
              justifyContent: "space-between",
            },
            TrailerButton: {
              type: UtilityButton,
              label: "Play Trailer",
              buttonType: "player",
            },
            DetailsBtn: {
              type: UtilityButton,
              label: "+ Details",
              buttonType: "details",
            },
            MoreDetails: {
              type: UtilityButton,
              label: "More Details",
            },
          },
        },
        MovieDetailsOverlay: {
          type: MovieDetailsOverlay,
          visible: false,
        },
      },
    };
  }

  get Gallery() {
    return this.getByRef("Gallery")!;
  }

  get Image() {
    return this.Gallery.getByRef("Image")!;
  }

  get Details() {
    return this.Gallery.getByRef("Details")!;
  }

  get Buttons() {
    return this.Details.getByRef("Buttons")!;
  }

  get DetailsBtn() {
    return this.Buttons.getByRef("DetailsBtn") as UtilityButton;
  }

  get TrailerButton() {
    return this.Buttons.getByRef("TrailerButton") as UtilityButton;
  }

  get Description() {
    return this.Details.getByRef("Description")!;
  }

  get MovieDetailsOverlay() {
    return this.Gallery.getByRef("MovieDetailsOverlay") as MovieDetailsOverlay;
  }

  get MoreDetails() {
    return this.Buttons.getByRef("MoreDetails") as UtilityButton;
  }

  set props(props: GalleryProps) {
    const {
      logoTitle,
      title,
      description,
      src,
      showBtn,
      showTrailers,
      isHomePage,
      id,
      isMovie,
      adult,
      isCentered,
    } = props;
    this.displayAverageColor(src);

    if (!isHomePage) {
      this.setScaledLogo(logoTitle, 400, 200, title);
      this.Gallery.patch({
        Details: {
          flex: {
            justifyContent: "center",
          },
          TitleLogo: {
            x: 90,
            y: 0,
          },
        },
      });
    } else {
      console.log("isHomePage", logoTitle);

      this.setScaledLogo(logoTitle, 700, 300, title);
    }

    this.Gallery.patch({
      Image: {
        texture: {
          src: src,
        },
      },
      Details: {
        flex: {
          justifyContent: isCentered ? "center" : "flex-end",
        },
        TitleLogo: {
          texture: {
            type: Lightning.textures.ImageTexture,
            src: logoTitle ? logoTitle : "",
          },
          visible: !!logoTitle,
        },
        Title: {
          text: {
            text: logoTitle ? "" : title, // title,
          },
        },
        Description: {
          text: {
            text: description,
          },
        },
        Buttons: {
          TrailerButton: {
            visible: !!showTrailers,
            id: id,
            label: "Play Trailer",
          },
          DetailsBtn: {
            visible: !!showBtn,
            id: id,
            isMovie: isMovie,
            label: "+ Details",
            adult: adult,
          },
          MoreDetails: {
            visible: isHomePage === false,
            id: id,
            isMovie: isMovie,
            label: "More Details",
          },
        },
      },
    });
  }

  async setScaledLogo(
    logoUrl: string,
    maxW: number,
    maxH: number,
    title?: string
  ) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Ensure cross-origin is handled

    img.onload = () => {
      const logoWidth = img.naturalWidth || img.width;
      const logoHeight = img.naturalHeight || img.height;
      let scaleW = 1,
        scaleH = 1;

      if (logoWidth > maxW) {
        scaleW = maxW / logoWidth;
      }

      if (logoHeight > maxH) {
        scaleH = maxH / logoHeight;
      }

      const scale = Math.min(scaleW, scaleH);

      this.Gallery.patch({
        Details: {
          TitleLogo: {
            scale: scale,
          },
        },
      });

      console.log(
        `Logo loaded successfully. Width: ${logoWidth}, Height: ${logoHeight}, Scale: ${scale}`
      );
    };

    img.onerror = (event) => {
      console.error("Failed to load logo image for scaling.", event);

      this.Gallery.patch({
        Details: {
          TitleLogo: {
            scale: 1,
            texture: {
              src: "", // Clear the texture
            },
          },
          Title: {
            text: {
              text: title, // Fallback to title text
            },
          },
        },
      });
    };

    img.src = logoUrl;
    console.log(`Attempting to load logo URL: ${logoUrl}`);
  }

  async displayAverageColor(url: string) {
    const averageColor = await getAverageARGBFromUrl(url);
    this.Gallery.patch({
      Mask: {
        color: averageColor,
      },
    });
  }

  showDetails(movie: MovieDetailsExtended) {
    this.MovieDetailsOverlay.showDetails(movie);
    this.Gallery.patch({
      Image: {
        y: SCREEN_SIZES.HEIGHT / 4,
      },
    });
  }

  hideDetails() {
    this.MovieDetailsOverlay.hideDetails();
    this.Gallery.patch({
      Image: {
        y: 0,
      },
    });
  }

  override _enable() {
    this.detailsAnimation(this.TrailerButton);
    this.detailsAnimation(this.DetailsBtn);
    this.detailsAnimation(this.MoreDetails);

    if (this.DetailsBtn.visible) {
      this._setState("DetailsBtn");
    } else {
      this._setState("TrailerButton");
    }
  }

  detailsAnimation(button: UtilityButton) {
    return button
      .animation({
        duration: 1,
        repeat: 0,
        actions: [
          {
            p: "x",
            v: { 0: -1000, 1: 0 },
          },
        ],
      })
      .start();
  }

  _handleCardFocus({
    title,
    overview,
    logoTitle,
  }: {
    title: string;
    overview: string;
    logoTitle: string;
  }) {
    this.patch({
      Gallery: {
        Details: {
          TitleLogo: {
            texture: {
              type: Lightning.textures.ImageTexture,
              src: logoTitle,
            },
          },
          Title: {
            text: {
              text: title,
            },
          },
          Description: {
            text: {
              text: overview,
            },
          },
        },
      },
    });
  }

  _handleCardUnfocus() {
    this.patch({
      Gallery: {
        Details: {
          Title: {
            text: {
              text: "",
            },
          },
          TitleLogo: {
            texture: {},
          },
          Description: {
            text: {
              text: "",
            },
          },
        },
      },
    });
  }

  static override _states() {
    return [
      class TrailerButton extends this {
        override _getFocused() {
          return this.TrailerButton;
        }

        override _handleRight() {
          if (this.MoreDetails.visible) {
            this._setState("MoreDetails");
          }
        }
      },
      class DetailsBtn extends this {
        override _getFocused() {
          return this.DetailsBtn;
        }

        override _handleLeft() {
          Router.focusWidget("Sidebar");
        }
      },
      class MoreDetails extends this {
        override _getFocused() {
          return this.MoreDetails;
        }

        override _handleLeft() {
          this._setState("TrailerButton");
        }
      },
    ];
  }
}

export default Gallery;
