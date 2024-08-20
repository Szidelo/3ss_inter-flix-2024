export enum KEYS {
  VK_MENU = "VK_MENU",
  VK_ENTER = "VK_ENTER",
  VK_LEFT = "VK_LEFT",
  VK_UP = "VK_UP",
  VK_RIGHT = "VK_RIGHT",
  VK_DOWN = "VK_DOWN",
  VK_0 = "VK_0",
  VK_1 = "VK_1",
  VK_2 = "VK_2",
  VK_3 = "VK_3",
  VK_4 = "VK_4",
  VK_5 = "VK_5",
  VK_6 = "VK_6",
  VK_7 = "VK_7",
  VK_8 = "VK_8",
  VK_9 = "VK_9",
  VK_RED = "VK_RED",
  VK_GREEN = "VK_GREEN",
  VK_YELLOW = "VK_YELLOW",
  VK_BLUE = "VK_BLUE",
  VK_REWIND = "VK_REWIND",
  VK_FAST_FWD = "VK_FAST_FWD",
  VK_STOP = "VK_STOP",
  VK_PLAY = "VK_PLAY",
  VK_RECORD = "VK_RECORD",
  VK_PAUSE = "VK_PAUSE",
  VK_PLAY_PAUSE = "VK_PLAY_PAUSE",
  VK_BACK = "VK_BACK",
  VK_INFO = "VK_INFO",
  VK_PREV = "VK_PREV",
  VK_NEXT = "VK_NEXT",
  VK_MINUS = "VK_MINUS",
  VK_CHANNEL_PREV = "VK_CHANNEL_PREV",
  VK_KEY_EXIT = "VK_KEY_EXIT",
  VK_SEARCH = "VK_SEARCH",
  VK_CAPTION = "VK_CAPTION",
  VK_CHANNEL_LIST = "VK_CHANNEL_LIST",
  VK_CHAN_UP = "VK_CHAN_UP",
  VK_CHAN_DOWN = "VK_CHAN_DOWN",
  VK_DONE = "VK_DONE",
  VK_CANCEL = "VK_CANCEL",
  VK_BACKSPACE = "VK_BACKSPACE",
  VK_SPACE = "VK_SPACE",
  VK_ESC = "VK_ESC",
}

export const KEY_MAPPINGS: { [key in KEYS]: number[] } = {
  [KEYS.VK_MENU]: [18],
  [KEYS.VK_ENTER]: [13, 29443],
  [KEYS.VK_LEFT]: [37],
  [KEYS.VK_UP]: [38],
  [KEYS.VK_RIGHT]: [39],
  [KEYS.VK_DOWN]: [40],
  [KEYS.VK_0]: [48],
  [KEYS.VK_1]: [49],
  [KEYS.VK_2]: [50],
  [KEYS.VK_3]: [51],
  [KEYS.VK_4]: [52],
  [KEYS.VK_5]: [53],
  [KEYS.VK_6]: [54],
  [KEYS.VK_7]: [55],
  [KEYS.VK_8]: [56],
  [KEYS.VK_9]: [57],
  [KEYS.VK_RED]: [82, 403],
  [KEYS.VK_GREEN]: [71, 404],
  [KEYS.VK_YELLOW]: [89, 405],
  [KEYS.VK_BLUE]: [66, 406],
  [KEYS.VK_REWIND]: [219, 412],
  [KEYS.VK_FAST_FWD]: [221, 417],
  [KEYS.VK_STOP]: [413],
  [KEYS.VK_PLAY]: [80, 415],
  [KEYS.VK_RECORD]: [416],
  [KEYS.VK_PAUSE]: [79, 19],
  [KEYS.VK_PLAY_PAUSE]: [10252],
  [KEYS.VK_BACK]: [8, 10009, 461],
  [KEYS.VK_INFO]: [457],
  [KEYS.VK_PREV]: [10232],
  [KEYS.VK_NEXT]: [10233],
  [KEYS.VK_MINUS]: [189],
  [KEYS.VK_CHANNEL_PREV]: [10190],
  [KEYS.VK_KEY_EXIT]: [10182],
  [KEYS.VK_SEARCH]: [10225],
  [KEYS.VK_CAPTION]: [10221],
  [KEYS.VK_CHANNEL_LIST]: [10073],
  [KEYS.VK_CHAN_UP]: [33, 427],
  [KEYS.VK_CHAN_DOWN]: [34, 428],
  [KEYS.VK_DONE]: [65376],
  [KEYS.VK_CANCEL]: [65385],
  [KEYS.VK_BACKSPACE]: [8],
  [KEYS.VK_SPACE]: [32],
  [KEYS.VK_ESC]: [27],
};

interface TizenWindow extends Window {
  tizen: {
    tvinputdevice: {
      getSupportedKeys(): Array<{ code: number; name: string }>;
      registerKeyBatch(keys: string[]): void;
    };
  };
}

const tizenWindow = window as unknown as TizenWindow;
const supportedKeys = tizenWindow.tizen?.tvinputdevice?.getSupportedKeys() || [];

if (tizenWindow.tizen && tizenWindow.tizen.tvinputdevice) {
  const keyNames: string[] = [];
  supportedKeys.forEach((key: { code: number; name: string }) => {
    if (key.code >= "0".charCodeAt(0) && key.code <= "9".charCodeAt(0)) {
      keyNames.push(key.name);
    }
    const keyCodes = [
      ...KEY_MAPPINGS[KEYS.VK_CHAN_UP],
      ...KEY_MAPPINGS[KEYS.VK_CHAN_DOWN],
      ...KEY_MAPPINGS[KEYS.VK_PLAY],
      ...KEY_MAPPINGS[KEYS.VK_PAUSE],
      ...KEY_MAPPINGS[KEYS.VK_PLAY_PAUSE],
      ...KEY_MAPPINGS[KEYS.VK_STOP],
      ...KEY_MAPPINGS[KEYS.VK_REWIND],
      ...KEY_MAPPINGS[KEYS.VK_FAST_FWD],
      ...KEY_MAPPINGS[KEYS.VK_RED],
      ...KEY_MAPPINGS[KEYS.VK_GREEN],
      ...KEY_MAPPINGS[KEYS.VK_YELLOW],
      ...KEY_MAPPINGS[KEYS.VK_BLUE],
    ];

    if (keyCodes.includes(key.code)) {
      keyNames.push(key.name);
    }
  });
  tizenWindow.tizen.tvinputdevice.registerKeyBatch(keyNames);
}

export const getPressedKey = (keyCode: number): KEYS | undefined => {
  for (const entry of Object.entries(KEY_MAPPINGS)) {
    const [key, codes] = entry;
    if (codes.includes(keyCode)) {
      return key as KEYS;
    }
  }
  console.warn(`Key not recognized: ${keyCode}`);
  return undefined;
};

export default KEYS;
