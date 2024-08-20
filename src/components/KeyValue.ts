import { Lightning } from "@lightningjs/sdk";
import { COLOURS } from "../../static/constants/Colours";
import PlaceHolder from "./PlaceHolder";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";

interface CardTemplateSpec extends Lightning.Component.TemplateSpec {
  Card: {
    w: number;
    h: number;
    zIndex: number;
    rect: boolean;
    flex: {
      direction: string;
      justifyContent: string;
      alignItems: string;
    };
    Key: {
      text: {
        text: string;
        fontSize: number;
        fontStyle: string;
        textAlign: string;
        textColor: string;
      };
    };
    Value: {
      text: {
        text: string;
        fontSize: number;
        fontStyle: string;
        textAlign: string;
        textColor: string;
      };
    };
    PlaceholderSvg: typeof PlaceHolder;
  };
}

type KeyValueProps = {
  key: string;
  value: string;
};

export class KeyValue extends Lightning.Component<CardTemplateSpec> {
  private _key = "";
  private _value = "";

  static override _template(): Lightning.Component.Template<CardTemplateSpec> {
    return {
      Card: {
        w: (SCREEN_SIZES.WIDTH - 150) / 2 - 60,
        h: 50,
        zIndex: 1,
        rect: true,
        flex: {
          direction: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        color: COLOURS.TRANSPARENT,
        Key: {
          text: {
            text: "Key",
            fontSize: 25,
            fontStyle: "bold",
            textAlign: "left",
            textColor: COLOURS.WHITE,
          },
        },
        Value: {
          text: {
            text: "Value",
            fontSize: 25,
            fontStyle: "bold",
            textAlign: "right",
            textColor: COLOURS.WHITE,
          },
        },
      },
    };
  }

  get key(): string {
    return this._key;
  }

  get value(): string {
    return this._value;
  }

  set props(props: KeyValueProps) {
    this._key = props.key;
    this._value = props.value;

    this.patch({
      Card: {
        Key: {
          text: {
            text: this._key,
          },
        },
        Value: {
          text: {
            text: this._value,
          },
        },
      },
    });
  }
}

export default KeyValue;
