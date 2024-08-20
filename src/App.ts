import { Lightning, Utils } from "@lightningjs/sdk";
import Router from "@lightningjs/sdk/src/Router";
import routes from "./routes";
import { Sidebar } from "./components/Sidebar";

interface AppTemplateSpec extends Lightning.Component.TemplateSpec {
  Widgets: {
    Sidebar: typeof Sidebar;
  };
}

export class App extends Router.App {
  static override _template(): Lightning.Component.Template<AppTemplateSpec> {
    return {
      ...super._template(),
      Widgets: {
        Sidebar: {
          type: Sidebar,
        },
      },
    };
  }

  override _setup() {
    Router.startRouter(routes, this);
  }

  override _init() {
    Router.navigate("splash");
    Router.focusPage();
  }
}

export default App;
