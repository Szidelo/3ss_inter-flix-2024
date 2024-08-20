import { Lightning } from "@lightningjs/sdk";
import SettingsColumnItem from "./SettingsColumnItem";
import { COLOURS } from "../../static/constants/Colours";

interface SettingsColumnTemplateSpec extends Lightning.Component.TemplateSpec {
  ListItem: typeof SettingsColumnItem;
}

export class SettingsColumn
  extends Lightning.Component<SettingsColumnTemplateSpec>
  implements Lightning.Component.ImplementTemplateSpec<SettingsColumnTemplateSpec>
{
  index = 0;

  static override _template(): Lightning.Component.Template<SettingsColumnTemplateSpec> {
    return {};
  }

  override _init() {
    // Set default language to English if not already set
    if (!localStorage.getItem("lang")) {
      localStorage.setItem("lang", JSON.stringify("EN"));
    }

    // Set default Parcon option to OFF if not already set
    if (!localStorage.getItem("parcon")) {
      localStorage.setItem("parcon", JSON.stringify("OFF"));
      //delete the password from localStorage
      localStorage.removeItem("password");
    }

    this.index = 0;
  }

  set items(items: { label: string; ref: string }[]) {
    this.children = items.map((item, index) => {
      return {
        ref: "SETTING-" + item.ref,
        type: SettingsColumnItem,
        y: index * 120,
        item,
        signals: {
          itemSelected: true,
        },
      };
    });
  }
  override _getFocused(): SettingsColumnItem {
    return this.children[this.index] as SettingsColumnItem;
  }

  itemSelected(item: SettingsColumnItem) {
    this.children.forEach((child) => {
      if (this.ref === "LanguageOptions") {
        child.patch({
          Label: {
            text: {
              textColor: COLOURS.WHITE,
            },
          },
        });
      }
    });
    if (this.ref === "LanguageOptions") {
      localStorage.setItem("lang", JSON.stringify(item.ref));
    } else if (this.ref === "ParconOptions") {
      if (item.ref !== "OFF") {
        localStorage.setItem("parcon", JSON.stringify(item.ref));
      }
    }
  }

  override _handleUp() {
    if (this.index > 0) {
      this.index--;
    }
  }

  override _handleDown() {
    if (this.index < this.children.length - 1) {
      this.index++;
    }
  }
}
