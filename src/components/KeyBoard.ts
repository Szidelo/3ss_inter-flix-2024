import { Lightning } from "@lightningjs/sdk";
import { Button } from "./Button";
import { COLOURS } from "../../static/constants/Colours";

class Keyboard extends Lightning.Component {
  _rowIndex = 0;
  _columnIndex = 0;

  static override _template() {
    const keys: string[][] = [
      ["1", "2", "3", "4", "5", "6"],
      ["7", "8", "9", "0", "DEL", "OK"],
    ];

    return {
      w: 330,
      h: 350,
      rect: true,
      color: COLOURS.GREY,
      flex: {
        direction: "column" as const,
        alignItems: "center" as const,
        justifyContent: "space-around" as const,
      },
      shader: {
        type: Lightning.shaders.RoundedRectangle,
        radius: 20,
      },
      children: keys.map((row) => ({
        flex: {
          direction: "row" as const,
          alignItems: "center" as const,
          justifyContent: "space-around" as const,
        },
        children: row.map((key) => ({
          type: Button,
          w: 70,
          h: 70,
          buttonText: key,
          textX: 35,
          textY: 35,
          fontSize: 36,
          backgroundColor: 0xff333333,
          textColor: 0xffffffff,
          flexItem: {
            margin: 10,
          },
        })),
      })),
    };
  }

  _getCurrentKey(): Lightning.Component | undefined {
    const row = this.children[this._rowIndex] as Lightning.Component | undefined;
    return row ? (row.children[this._columnIndex] as Lightning.Component | undefined) : undefined;
  }

  private _updateFocus() {
    this.children.forEach((row, rowIndex) => {
      row.children.forEach((button, colIndex) => {
        button.patch({
          color:
            rowIndex === this._rowIndex && colIndex === this._columnIndex ? 0xffaaaaaa : 0xff333333,
        });
      });
    });
  }

  _setIndex(index: number) {
    this._rowIndex = Math.floor(index / 6);
    this._columnIndex = index % 6;
    this._updateFocus();
  }

  focusNext() {
    const row = this.children[this._rowIndex] as Lightning.Component | undefined;
    if (row) {
      this._columnIndex = (this._columnIndex + 1) % row.children.length;
      this._updateFocus();
    }
  }

  focusPrevious() {
    const row = this.children[this._rowIndex] as Lightning.Component | undefined;
    if (row) {
      this._columnIndex = (this._columnIndex - 1 + row.children.length) % row.children.length;
      this._updateFocus();
    }
  }

  focusDown() {
    this._rowIndex = (this._rowIndex + 1) % this.children.length;
    const row = this.children[this._rowIndex] as Lightning.Component | undefined;
    if (row) {
      this._columnIndex = Math.min(this._columnIndex, row.children.length - 1);
      this._updateFocus();
    }
  }

  focusUp() {
    this._rowIndex = (this._rowIndex - 1 + this.children.length) % this.children.length;
    const row = this.children[this._rowIndex] as Lightning.Component | undefined;
    if (row) {
      this._columnIndex = Math.min(this._columnIndex, row.children.length - 1);
      this._updateFocus();
    }
  }

  triggerEnter(): string | undefined {
    const currentKey = this._getCurrentKey();
    if (currentKey) {
      const buttonText = (currentKey as any).buttonText;
      if (buttonText) {
        return buttonText;
      }
    }
  }

  setKey(key: string) {
    const keys: string[][] = [
      ["1", "2", "3", "4", "5", "6"],
      ["7", "8", "9", "0", "DEL", "OK"],
    ];
    for (let i = 0; i < keys.length; i++) {
      const row = keys[i];
      if (row !== undefined) {
        const rowIndex = row.indexOf(key);
        if (rowIndex !== -1) {
          this._rowIndex = i;
          this._columnIndex = rowIndex;
          this._updateFocus();
          break;
        }
      }
    }
  }
}

export default Keyboard;
