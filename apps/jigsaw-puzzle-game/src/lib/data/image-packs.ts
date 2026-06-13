/**
 * חבילות תמונות לפאזל
 */

import type { ImagePack } from "$lib/types";
import { APP_ASSETS_URL, asset } from "$lib/config";

const img = (path: string) => asset(`${APP_ASSETS_URL}/images/${path}`);

export const ALL_IMAGE_PACKS: ImagePack[] = [
  {
    id: "animals",
    name: "חיות",
    icon: "🐾",
    description: "חיות מוכרות",
    images: [
      { id: "cat", name: "חתול", src: img("animals/cat.jpg"), ttsText: "חתול" },
      { id: "dog", name: "כלב", src: img("animals/dog.jpg"), ttsText: "כלב" },
      { id: "fish", name: "דג", src: img("animals/fish.jpg"), ttsText: "דג" },
    ],
  },
];

export function getPackById(id: string): ImagePack | undefined {
  return ALL_IMAGE_PACKS.find((p) => p.id === id);
}

export function getDefaultPack(): ImagePack {
  return ALL_IMAGE_PACKS[0];
}
