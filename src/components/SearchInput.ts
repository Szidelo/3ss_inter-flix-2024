import { Lightning, Utils } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { Input } from "@lightningjs/ui-components";

interface SearchInputTemplateSpec extends Lightning.Component.TemplateSpec {
  Content: {
    InputField: object;
    SearchButton: object;
    SearchImage: object;
  };
}

export default class SearchInput
  extends Lightning.Component<SearchInputTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SearchInputTemplateSpec>
{
  private _inputText = "";

  static override _template() {
    return {
      x: SCREEN_SIZES.WIDTH * 0.5,
      mountX: 0.5,
      rect: true,
      w: 350,
      h: 60,
      color: COLOURS.GREY,
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 15,
        stroke: 2,
        strokeColor: COLOURS.WHITE,
      },
      Content: {
        SearchImage: {
          x: 10,
          y: 30,
          mountY: 0.5,
          w: 40,
          h: 40,
          src: Utils.asset("images/search.png"),
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            strokeColor: 0x00000000,
          },
        },
        InputField: {
          x: 60,
          y: 30,
          mountY: 0.5,
          type: Input,
          w: 290,
          h: 60,
          text: {
            text: "Search...",
            fontSize: 44,
            textColor: COLOURS.WHITE,
          },
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            strokeColor: 0x00000000,
            radius: [0, 15, 15, 0],
          },
        },
      },
    };
  }

  get Content() {
    return this.tag("Content");
  }

  get InputField() {
    return this.Content?.tag("InputField");
  }

  set inputText(value: string) {
    this._inputText = value;
    this.InputField?.patch({
      text: { text: this._inputText },
    });
  }

  get inputText() {
    return this._inputText;
  }

  override _handleKey(event: KeyboardEvent) {
    if (event.key.length === 1) {
      this.inputText += event.key;
    } else if (event.key === "Backspace") {
      this.inputText = this.inputText.slice(0, -1);
    }
  }

  override _handleEnter() {
    this.signal("search", this.inputText);
  }

  override _handleDown() {
    this.signal("focusList");
  }

  override _handleLeft() {
    this.signal("focusSidebar");
  }

  get inputValue() {
    return this.inputText;
  }

  override _focus() {
    this.patch({
      smooth: { x: [SCREEN_SIZES.WIDTH * 0.5, { duration: 0.2 }] },
    });
    this.InputField?.patch({
      color: COLOURS.WHITE,
    });
  }

  override _unfocus() {
    this.patch({
      smooth: { x: [SCREEN_SIZES.WIDTH + 120, { duration: 0.2 }] },
    });
    this.InputField?.patch({
      color: COLOURS.GREEN,
    });
  }
}
