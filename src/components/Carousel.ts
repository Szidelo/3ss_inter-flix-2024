import { Lightning, Log, Router } from "@lightningjs/sdk";
import Card from "./Card";
import { CardItem } from "../utils/interfaces/items/itemsInterface";

interface CarouselTemplateSpec extends Lightning.Component.TemplateSpec {
  Title: object;
  List: {
    type: ListComponentType;
    items: Card[];
  };
}

interface ListComponentType extends Lightning.components.ListComponent {
  getElement(index: number): Lightning.Component<any>;
}

export class Carousel extends Lightning.Component<CarouselTemplateSpec> {
  currentIndex = 0;

  _title = "";
  _isMovie = true;
  _isTop = false;
  _getItems: () => Promise<CardItem[]> = () => Promise.resolve([]);

  static override _template() {
    return {
      w: 1820,
      h: 400,
      y: 200,
      Title: {
        x: 30,
        y: -25,
        text: {
          text: "",
          fontSize: 38,
          textColor: 0xffffffff,
        },
      },
      List: {
        type: Lightning.components.ListComponent,
        w: 1780,
        h: 400,
        itemSize: 230,
        roll: true,
        clipping: true,
        items: [],
        flex: {
          paddingLeft: 30,
          flexDirection: "row",
        },
      },
    };
  }

  override _init() {
    this.currentIndex = 0;
    this.loadMovies();
    this._setState("Carousel");
  }

  get List(): ListComponentType {
    return this.tag("List") as ListComponentType;
  }

  set isMovie(isMovie: boolean) {
    this._isMovie = isMovie;
  }

  get isMovie() {
    return this._isMovie;
  }

  set isTop(isTop: boolean) {
    this._isTop = isTop;
  }

  get isTop() {
    return this._isTop;
  }

  async loadMovies() {
    try {
      const movies: CardItem[] = await this._getItems();
      const items = movies.map((movie: CardItem, index: number) => ({
        type: Card,
        props: {
          id: movie.id,
          title: movie.title,
          src: movie.src,
          overview: movie.overview,
          adult: movie.adult,
          isMovie: this.isMovie,
          isTop: this.isTop,
          topIndex: index,
        },
      }));
      this.List.items = items;

      if (this.isTop) {
        this.List.patch({
          itemSize: 400,
          flex: {
            paddingLeft: 200,
          },
        });
      }
      this._refocus();
    } catch (error) {
      console.error("Error loading movies:", error);
    }
  }

  set props(props: {
    title: string;
    isMovie: boolean;
    isTop: boolean;
    getItems: () => Promise<CardItem[]>;
  }) {
    const { title, isMovie, isTop, getItems } = props;

    this.patch({
      Title: {
        text: { text: title },
      },
    });

    this._title = title;
    this._isTop = isTop;
    this._isMovie = isMovie;
    this._getItems = getItems;
  }

  get title() {
    return this._title;
  }

  get getItems() {
    return this._getItems;
  }

  static override _states() {
    return [
      class Carousel extends this {
        override _getFocused() {
          const list = this.List as ListComponentType;

          if (list.length > 0) {
            return list.getElement(this.currentIndex);
          }
          return null;
        }

        override _handleLeftRelease() {
          if (this.currentIndex > 0) {
            this.currentIndex--;
            this.List?.setIndex(this.currentIndex);
          } else {
            Router.focusWidget("Sidebar");
          }
        }

        override _handleRightRelease() {
          const list = this.List as ListComponentType;

          if (list && this.currentIndex < list.length - 1) {
            this.currentIndex++;
            this.List?.setIndex(this.currentIndex);
          }
        }
      },
    ];
  }
}

export default Carousel;
