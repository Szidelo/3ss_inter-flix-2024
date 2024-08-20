import { BASE_URL } from "../../../static/constants/URLS";
import API_KEY from "../../../.env/.key";

class DataFetcher {
  protected static acceptLanguage = "en-US,en;q=0.5";
  protected static defaultPaginationSize = 20;

  static createUrl = (url: string): string => {
    return BASE_URL + `/${url}`;
  };

  protected request = async <T extends object>(
    info: RequestInfo,
    init?: RequestInit
  ): Promise<T | null> => {
    const defaultUrl = DataFetcher.createUrl(info as string);
    const defaultParams = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_KEY,
        "Accept-Language": DataFetcher.acceptLanguage,
      },
    };
    const response = await this.fetch(defaultUrl, {
      ...defaultParams,
      ...init,
    });
    if (!response) {
      const err = new Error("No response received");
      console.error(err);
      throw err;
    }

    return this.handleResponse<T>(response);
  };

  protected fetch = (
    info: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    return fetch(info, init);
  };

  protected handleResponse = async <T>(response: Response): Promise<T> => {
    const data: T = await response.json();
    if (response.status !== 200) {
      const error = `Request failed with status ${response.status}`;
      console.error(error);
      throw new Error(error);
    }
    return data;
  };
}

export { DataFetcher };
