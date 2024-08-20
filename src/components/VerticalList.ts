import { Lightning } from "@lightningjs/sdk";
import Carousel from "./Carousel";
import Card from "./Card";

interface VerticalListTemplateSpec extends Lightning.Component.TemplateSpec {
  List: object;
}

export class VerticalList extends Lightning.Component<VerticalListTemplateSpec> {
  currentIndex = 0;

  static override _template() {
    return {
      w: 1870,
      h: 1080,
      zIndex: -1,
      List: {
        type: Lightning.components.ListComponent,
        w: 1870,
        h: 15000,
        itemSize: 30,
        roll: true,
        clipping: true,
        items: [],
        flex: {
          flexDirection: "column",
        },
        transitions: {
          y: { duration: 0.3 },
        },
      },
    };
  }

  override _init() {
    this.currentIndex = 0;
    this._setState("VerticalList");
  }

  async loadItems(itemsData: Carousel[] = []) {
    try {
      this.List.items = itemsData.map((item: Carousel, index: number) => ({
        type: Carousel,
        y: 600 + index * 400,
        x: -index * 30,
        props: {
          isMovie: item.isMovie,
          title: item.title,
          isTop: item.isTop,
          getItems: item.getItems,
        },
      }));

      this._refocus();
    } catch (error) {
      console.error("Error loading items:", error);
    }
  }

  async clearItems() {
    this.List.items = [];
  }

  get firstCarousel(): Carousel | any {
    return this.List?.items[0];
  }

  get lastCarousel(): Carousel | any {
    const items = this.List?.items;
    return items[items.length - 1];
  }

  get getCurrentIndex(): number {
    return this.currentIndex;
  }

  get List() {
    return this.tag("List") as Lightning.components.ListComponent;
  }

  set setCurrentIndex(index: number) {
    this.currentIndex = index;
  }

  repositionWrapper() {
    const wrapper = this.List as Lightning.components.ListComponent;
    const sliderH = this.h;
    const currentFocus = wrapper?.getElement(this.currentIndex);
    const currentFocusY = currentFocus?.y;
    if (currentFocus && currentFocusY) {
      const currentFocusOuterHeight = currentFocusY + currentFocus.h;

      this.signal("$dimGallery", this.currentIndex);

      if (this.currentIndex === 0) {
        wrapper.setSmooth("y", 0, { duration: 0.3 });
      } else if (currentFocusY < 0) {
        wrapper.setSmooth("y", -currentFocus.y);
      } else if (currentFocusOuterHeight > sliderH) {
        wrapper.setSmooth("y", sliderH - currentFocusOuterHeight);
      }
    }
  }

  static override _states() {
    return [
      class VerticalList extends this {
        override _getFocused(): Lightning.Component<VerticalListTemplateSpec> | null | any {
          const list = this.List;

          if (list && list.length > 0) {
            this.repositionWrapper();
            const focused: Card = (
              list.getElement(this.currentIndex) as Carousel
            )._getFocused() as Card;

            this.signal("$onFocusGallery", focused);
            return list.getElement(this.currentIndex);
          }
          return null;
        }

        override _handleDown() {
          const list = this.List;

          if (this.currentIndex < list.length - 1) {
            this.currentIndex++;
            list.setIndex(this.currentIndex);
          }
        }
      },
    ];
  }
}

export default VerticalList;
