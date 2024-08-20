import API_KEY from "../../.env/.key";
import { SCREEN_SIZES } from "../../static/constants/ScreenSizes";
import { BASE_URL, URLS } from "../../static/constants/URLS";
let baseImageUrl: string;

const defaultFetchParams = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + API_KEY,
  },
};

export function getImageUrl(path: string, posterSize = SCREEN_SIZES.CARD_IMAGE_WIDTH) {
  if (path.startsWith("http")) {
    return path.replace(SCREEN_SIZES.CARD_IMAGE_WIDTH, posterSize);
  }
  return baseImageUrl + posterSize + path;
}

export function get(path: string, params = {}) {
  return fetch(BASE_URL + path, {
    ...defaultFetchParams,
    ...params,
  }).then((response) => response.json());
}

export function loadConfiguration(): Promise<void> {
  return get(URLS.CONFIGURATION)
    .then((response) => {
      baseImageUrl = response.images?.secure_base_url;
    })
    .catch((error) => {
      console.error("Failed to load configuration", error);
      throw error;
    });
}

export async function getAverageARGBFromUrl(imageUrl: string): Promise<number> {
  const defaultARGB = 0xff000000;
  const darkeningFactor = 0.5;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(defaultARGB);
        return;
      }

      const width = (canvas.width = img.naturalWidth || img.width);
      const height = (canvas.height = img.naturalHeight || img.height);

      context.drawImage(img, 0, 0, width, height);

      try {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        let i = -4;
        const length = data.length;
        const rgb = { r: 0, g: 0, b: 0 };
        let count = 0;
        const blockSize = 5;

        while ((i += blockSize * 4) < length) {
          ++count;
          rgb.r += data[i] ?? 0;
          rgb.g += data[i + 1] ?? 0;
          rgb.b += data[i + 2] ?? 0;
        }

        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);

        rgb.r = Math.max(0, rgb.r * darkeningFactor);
        rgb.g = Math.max(0, rgb.g * darkeningFactor);
        rgb.b = Math.max(0, rgb.b * darkeningFactor);

        const argb = (0xff << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b;

        resolve(argb >>> 0);
      } catch (e) {
        resolve(defaultARGB);
      }
    };

    img.onerror = () => {
      resolve(defaultARGB);
    };
  });
}

export default {
  get,
  loadConfiguration,
};
