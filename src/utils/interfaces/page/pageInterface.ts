import { Lightning, Router } from "@lightningjs/sdk";

export interface CustomPageInstance extends Router.PageInstance {
  loaded: boolean;
  apiIndex: number;
  leftoverTiles: any[];
  _Column: Lightning.Component;
  getMoreRows: () => Promise<void>;
  reset: () => void;
}
