import { Row } from "@lightningjs/ui-components";
import Card from "../../components/Card";
import { getImageUrl } from "../";
import { CardItem, GalleryItem, Item, RowItem } from "../interfaces/items/itemsInterface";
import { Gallery } from "../../components/Gallery";
import { SCREEN_SIZES } from "../../../static/constants/ScreenSizes";

export function convertItemsToCards(items: Item[] = []): CardItem[] {
  return items.map((item): CardItem => {
    return {
      type: Card,
      src: getImageUrl(item.poster_path || item.profile_path || ""),
      w: 185,
      h: 278,
      title: item.title || item.name || "",
      data: item,
      id: item.id,
      overview: item.overview,
      adult: item.id % 2 == 0,
    };
  });
}
export function convertItemToGallery(items: Item): GalleryItem {
  console.log("items", items);
  const { poster_path, profile_path, title, name, overview, id } = items;

  return {
    type: Gallery,
    backdrop_path: getImageUrl(poster_path || profile_path || "", SCREEN_SIZES.GALLERY_IMAGE_WIDTH),
    title: title || name || "",
    id: id,
    overview: overview || "",
    adult: id % 2 == 0,
  };
}

export function convertCardsToRows(items: CardItem[][] = []): RowItem[] {
  return items.map(
    (items): RowItem => ({
      type: Row,
      itemSpacing: 52,
      h: 300,
      neverScroll: true,
      items,
    }),
  );
}
