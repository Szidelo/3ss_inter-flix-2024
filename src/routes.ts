import { Router } from "@lightningjs/sdk";
import { SplashScreen } from "./pages/SplashScreen";
import { Home } from "./pages/Home";
import api from "./utils";
import { PlayerPage } from "./pages/PlayerPage";
import { MovieDetails } from "./pages/MovieDetails";
import SettingsPage from "./pages/SettingsPage";
import SearchInput from "./components/SearchInput";
import SearchPage from "./pages/SearchPage";

interface PageInstance extends Router.PageInstance {
  loadData: (id: number, isMovie: boolean) => Promise<void>;
}

const routes: Router.Config["routes"] = [
  {
    path: "playerPage/:id",
    component: PlayerPage as Router.PageConstructor<Router.PageInstance>,
  },
  {
    path: "splash",
    component: SplashScreen as Router.PageConstructor<Router.PageInstance>,
  },
  {
    path: "home",
    component: Home as Router.PageConstructor<Router.PageInstance>,
    widgets: ["sidebar"],
  },
  {
    path: "movie/:id",
    component: MovieDetails as unknown as Router.PageConstructor<Router.PageInstance>,
    on: (page: PageInstance, { id }) => {
      return new Promise((resolve, reject) => {
        page
          .loadData(Number(id), true)
          .then(() => resolve())
          .catch((error) => reject(error));
      });
    },
  },
  {
    path: "tvshow/:id",
    component: MovieDetails as unknown as Router.PageConstructor<Router.PageInstance>,
    on: (page: PageInstance, { id }) => {
      return new Promise((resolve, reject) => {
        page
          .loadData(Number(id), false)
          .then(() => resolve())
          .catch((error) => reject(error));
      });
    },
  },
  {
    path: "settings",
    component: SettingsPage as Router.PageConstructor<Router.PageInstance>,
    widgets: ["sidebar"],
  },
  {
    path: "search",
    component: SearchPage as Router.PageConstructor<Router.PageInstance>,
    widgets: ["sidebar"],
  },
];

const boot = (qs: Router.QueryParams): Promise<void> => {
  return api.loadConfiguration();
};

export const routerConfig: Router.Config = {
  root: "splash",
  boot,
  routes,
};

export default routerConfig;
