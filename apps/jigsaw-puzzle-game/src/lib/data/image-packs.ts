/**
 * חבילות תמונות לפאזל
 */

import type { ImagePack } from "$lib/types";

export const ALL_IMAGE_PACKS: ImagePack[] = [
  {
    id: "animals",
    name: "חיות",
    icon: "🐾",
    description: "חיות מוכרות",
    images: [
      { id: "cat", name: "חתול", src: "/images/animals/cat.jpg", ttsText: "חתול" },
      { id: "dog", name: "כלב", src: "/images/animals/dog.jpg", ttsText: "כלב" },
      { id: "fish", name: "דג", src: "/images/animals/fish.jpg", ttsText: "דג" },
    ],
  },
];

export function getPackById(id: string): ImagePack | undefined {
  return ALL_IMAGE_PACKS.find((p) => p.id === id);
}

export function getDefaultPack(): ImagePack {
  return ALL_IMAGE_PACKS[0];
}
