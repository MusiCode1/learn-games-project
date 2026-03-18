/**
 * חבילות תמונות לפאזל
 */

import type { ImagePack } from "$lib/types";
import { APP_ASSETS_URL, asset } from "$lib/config";

const img = (path: string) => asset(`${APP_ASSETS_URL}/images/${path}`);

export const ALL_IMAGE_PACKS: ImagePack[] = [
  // === צילומים ===
  {
    id: "landscapes",
    name: "נוף",
    icon: "\u{1F3DE}",
    description: "תמונות נוף מרהיבות",
    images: [
      { id: "beach", name: "חוף ים", src: img("landscapes/beach.jpg"), ttsText: "חוף ים" },
      { id: "desert", name: "מדבר", src: img("landscapes/desert.jpg"), ttsText: "מדבר" },
      { id: "desert-dunes", name: "דיונות", src: img("landscapes/desert-dunes.jpg"), ttsText: "דיונות חול" },
      { id: "flower-field", name: "שדה פרחים", src: img("landscapes/flower-field.jpg"), ttsText: "שדה פרחים" },
      { id: "green-forest", name: "יער ירוק", src: img("landscapes/green-forest.jpg"), ttsText: "יער ירוק" },
      { id: "lake", name: "אגם", src: img("landscapes/lake.jpg"), ttsText: "אגם" },
      { id: "lake-autumn", name: "אגם בסתיו", src: img("landscapes/lake-autumn.jpg"), ttsText: "אגם בסתיו" },
      { id: "lavender-field", name: "שדה לבנדר", src: img("landscapes/lavender-field.jpg"), ttsText: "שדה לבנדר" },
      { id: "mountains-snow", name: "הרים מושלגים", src: img("landscapes/mountains-snow.jpg"), ttsText: "הרים מושלגים" },
      { id: "rainbow", name: "קשת בענן", src: img("landscapes/rainbow.jpg"), ttsText: "קשת בענן" },
      { id: "river", name: "נהר", src: img("landscapes/river.jpg"), ttsText: "נהר" },
      { id: "snowy-mountains", name: "הרי שלג", src: img("landscapes/snowy-mountains.jpg"), ttsText: "הרי שלג" },
      { id: "sunset", name: "שקיעה", src: img("landscapes/sunset.jpg"), ttsText: "שקיעה" },
      { id: "waterfall", name: "מפל מים", src: img("landscapes/waterfall.jpg"), ttsText: "מפל מים" },
      { id: "waterfall-jungle", name: "מפל בג׳ונגל", src: img("landscapes/waterfall-jungle.jpg"), ttsText: "מפל בג׳ונגל" },
    ],
  },
  {
    id: "animals-farm",
    name: "חיות חווה",
    icon: "\u{1F404}",
    description: "חיות מהחווה",
    images: [
      { id: "cow", name: "פרה", src: img("animals-farm/cow.jpg"), ttsText: "פרה" },
      { id: "horse", name: "סוס", src: img("animals-farm/horse.jpg"), ttsText: "סוס" },
      { id: "rooster", name: "תרנגול", src: img("animals-farm/rooster.jpg"), ttsText: "תרנגול" },
      { id: "sheep", name: "כבשים", src: img("animals-farm/sheep.jpg"), ttsText: "כבשים" },
      { id: "pig", name: "חזיר", src: img("animals-farm/pig.jpg"), ttsText: "חזיר" },
      { id: "goat", name: "עז", src: img("animals-farm/goat.jpg"), ttsText: "עז" },
      { id: "donkey", name: "חמור", src: img("animals-farm/donkey.jpg"), ttsText: "חמור" },
      { id: "duck", name: "ברווז", src: img("animals-farm/duck.jpg"), ttsText: "ברווז" },
      { id: "hen-chicks", name: "תרנגולת ואפרוחים", src: img("animals-farm/hen-chicks.jpg"), ttsText: "תרנגולת ואפרוחים" },
      { id: "rabbit", name: "ארנב", src: img("animals-farm/rabbit.jpg"), ttsText: "ארנב" },
      { id: "turkey", name: "תרנגול הודו", src: img("animals-farm/turkey.jpg"), ttsText: "תרנגול הודו" },
      { id: "goose", name: "אווז", src: img("animals-farm/goose.jpg"), ttsText: "אווז" },
    ],
  },
  {
    id: "animals-wild",
    name: "חיות בר",
    icon: "\u{1F981}",
    description: "חיות בר מהטבע",
    images: [
      { id: "lion", name: "אריה", src: img("animals-wild/lion.jpg"), ttsText: "אריה" },
      { id: "elephant", name: "פיל", src: img("animals-wild/elephant.jpg"), ttsText: "פיל" },
      { id: "giraffe", name: "ג׳ירפה", src: img("animals-wild/giraffe.jpg"), ttsText: "ג׳ירפה" },
      { id: "zebra", name: "זברה", src: img("animals-wild/zebra.jpg"), ttsText: "זברה" },
      { id: "monkey", name: "קוף", src: img("animals-wild/monkey.jpg"), ttsText: "קוף" },
      { id: "bear", name: "דוב", src: img("animals-wild/bear.jpg"), ttsText: "דוב" },
      { id: "tiger", name: "נמר", src: img("animals-wild/tiger.jpg"), ttsText: "נמר" },
      { id: "hippo", name: "היפופוטם", src: img("animals-wild/hippo.jpg"), ttsText: "היפופוטם" },
      { id: "crocodile", name: "תנין", src: img("animals-wild/crocodile.jpg"), ttsText: "תנין" },
      { id: "eagle", name: "נשר", src: img("animals-wild/eagle.jpg"), ttsText: "נשר" },
      { id: "panda", name: "פנדה", src: img("animals-wild/panda.jpg"), ttsText: "פנדה" },
      { id: "wolf", name: "זאב", src: img("animals-wild/wolf.jpg"), ttsText: "זאב" },
      { id: "kangaroo", name: "קנגורו", src: img("animals-wild/kangaroo.jpg"), ttsText: "קנגורו" },
      { id: "penguin", name: "פינגווין", src: img("animals-wild/penguin.jpg"), ttsText: "פינגווין" },
    ],
  },
  {
    id: "animals-pets",
    name: "חיות מחמד",
    icon: "\u{1F431}",
    description: "חיות מחמד חמודות",
    images: [
      { id: "kitten", name: "חתלתול", src: img("animals-pets/kitten.jpg"), ttsText: "חתלתול" },
      { id: "puppy", name: "גור כלבים", src: img("animals-pets/puppy.jpg"), ttsText: "גור כלבים" },
      { id: "cat", name: "חתול", src: img("animals-pets/cat.jpg"), ttsText: "חתול" },
      { id: "dog", name: "כלב", src: img("animals-pets/dog.jpg"), ttsText: "כלב" },
      { id: "bunny", name: "ארנבון", src: img("animals-pets/bunny.jpg"), ttsText: "ארנבון" },
      { id: "hamster", name: "אוגר", src: img("animals-pets/hamster.jpg"), ttsText: "אוגר" },
      { id: "guinea-pig", name: "שרקן", src: img("animals-pets/guinea-pig.jpg"), ttsText: "שרקן" },
      { id: "parrot", name: "תוכי", src: img("animals-pets/parrot.jpg"), ttsText: "תוכי" },
      { id: "colorful-parrot", name: "תוכי צבעוני", src: img("animals-pets/colorful-parrot.jpg"), ttsText: "תוכי צבעוני" },
      { id: "turtle", name: "צב ים", src: img("animals-pets/turtle.jpg"), ttsText: "צב ים" },
      { id: "goldfish", name: "דג זהב", src: img("animals-pets/goldfish.jpg"), ttsText: "דג זהב" },
      { id: "tropical-fish", name: "דגים טרופיים", src: img("animals-pets/tropical-fish.jpg"), ttsText: "דגים טרופיים" },
    ],
  },
  {
    id: "fruits",
    name: "פירות",
    icon: "\u{1F34E}",
    description: "פירות טריים וצבעוניים",
    images: [
      { id: "apple", name: "תפוח", src: img("fruits/apple.jpg"), ttsText: "תפוח" },
      { id: "banana", name: "בננה", src: img("fruits/banana.jpg"), ttsText: "בננה" },
      { id: "strawberry", name: "תות", src: img("fruits/strawberry.jpg"), ttsText: "תות" },
      { id: "grapes", name: "ענבים", src: img("fruits/grapes.jpg"), ttsText: "ענבים" },
      { id: "watermelon", name: "אבטיח", src: img("fruits/watermelon.jpg"), ttsText: "אבטיח" },
      { id: "orange", name: "תפוז", src: img("fruits/orange.jpg"), ttsText: "תפוז" },
      { id: "pear", name: "אגס", src: img("fruits/pear.jpg"), ttsText: "אגס" },
      { id: "kiwi", name: "קיווי", src: img("fruits/kiwi.jpg"), ttsText: "קיווי" },
      { id: "pineapple", name: "אננס", src: img("fruits/pineapple.jpg"), ttsText: "אננס" },
      { id: "mango", name: "מנגו", src: img("fruits/mango.jpg"), ttsText: "מנגו" },
      { id: "peach", name: "אפרסק", src: img("fruits/peach.jpg"), ttsText: "אפרסק" },
      { id: "cherry", name: "דובדבן", src: img("fruits/cherry.jpg"), ttsText: "דובדבן" },
      { id: "pomegranate", name: "רימון", src: img("fruits/pomegranate.jpg"), ttsText: "רימון" },
      { id: "lemon", name: "לימון", src: img("fruits/lemon.jpg"), ttsText: "לימון" },
    ],
  },
  {
    id: "vegetables",
    name: "ירקות",
    icon: "\u{1F966}",
    description: "ירקות טריים מהגינה",
    images: [
      { id: "carrot", name: "גזר", src: img("vegetables/carrot.jpg"), ttsText: "גזר" },
      { id: "tomato", name: "עגבנייה", src: img("vegetables/tomato.jpg"), ttsText: "עגבנייה" },
      { id: "cucumber", name: "מלפפון", src: img("vegetables/cucumber.jpg"), ttsText: "מלפפון" },
      { id: "bell-pepper", name: "פלפל", src: img("vegetables/bell-pepper.jpg"), ttsText: "פלפל" },
      { id: "eggplant", name: "חציל", src: img("vegetables/eggplant.jpg"), ttsText: "חציל" },
      { id: "corn", name: "תירס", src: img("vegetables/corn.jpg"), ttsText: "תירס" },
      { id: "broccoli", name: "ברוקולי", src: img("vegetables/broccoli.jpg"), ttsText: "ברוקולי" },
      { id: "onion", name: "בצל", src: img("vegetables/onion.jpg"), ttsText: "בצל" },
      { id: "potato", name: "תפוח אדמה", src: img("vegetables/potato.jpg"), ttsText: "תפוח אדמה" },
      { id: "peas", name: "אפונה", src: img("vegetables/peas.jpg"), ttsText: "אפונה" },
      { id: "cabbage", name: "כרוב", src: img("vegetables/cabbage.jpg"), ttsText: "כרוב" },
      { id: "pumpkin", name: "דלעת", src: img("vegetables/pumpkin.jpg"), ttsText: "דלעת" },
      { id: "radish", name: "צנון", src: img("vegetables/radish.jpg"), ttsText: "צנון" },
    ],
  },
  // === ציורים ===
  {
    id: "drawings-animals",
    name: "ציורי חיות",
    icon: "\u{1F3A8}",
    description: "ציורים חמודים של חיות",
    images: [
      { id: "lion", name: "אריה", src: img("drawings-animals/lion.png"), ttsText: "אריה" },
      { id: "elephant", name: "פיל", src: img("drawings-animals/elephant.png"), ttsText: "פיל" },
      { id: "cat", name: "חתול", src: img("drawings-animals/cat.png"), ttsText: "חתול" },
      { id: "dog", name: "כלב", src: img("drawings-animals/dog.png"), ttsText: "כלב" },
      { id: "giraffe", name: "ג׳ירפה", src: img("drawings-animals/giraffe.png"), ttsText: "ג׳ירפה" },
      { id: "monkey", name: "קוף", src: img("drawings-animals/monkey.png"), ttsText: "קוף" },
      { id: "bear", name: "דוב", src: img("drawings-animals/bear.png"), ttsText: "דוב" },
      { id: "rabbit", name: "ארנב", src: img("drawings-animals/rabbit.png"), ttsText: "ארנב" },
      { id: "butterfly", name: "פרפר", src: img("drawings-animals/butterfly.png"), ttsText: "פרפר" },
      { id: "owl", name: "ינשוף", src: img("drawings-animals/owl.png"), ttsText: "ינשוף" },
      { id: "dolphin", name: "דולפין", src: img("drawings-animals/dolphin.png"), ttsText: "דולפין" },
      { id: "turtle", name: "צב", src: img("drawings-animals/turtle.png"), ttsText: "צב" },
      { id: "penguin", name: "פינגווין", src: img("drawings-animals/penguin.png"), ttsText: "פינגווין" },
      { id: "parrot", name: "תוכי", src: img("drawings-animals/parrot.png"), ttsText: "תוכי" },
    ],
  },
  {
    id: "drawings-fruits-vegs",
    name: "ציורי פירות וירקות",
    icon: "\u{1F34C}",
    description: "ציורים חמודים של פירות וירקות",
    images: [
      { id: "apple", name: "תפוח", src: img("drawings-fruits-vegs/apple.png"), ttsText: "תפוח" },
      { id: "banana", name: "בננה", src: img("drawings-fruits-vegs/banana.png"), ttsText: "בננה" },
      { id: "strawberry", name: "תות", src: img("drawings-fruits-vegs/strawberry.png"), ttsText: "תות" },
    ],
  },
];

export function getPackById(id: string): ImagePack | undefined {
  return ALL_IMAGE_PACKS.find((p) => p.id === id);
}

export function getDefaultPack(): ImagePack {
  return ALL_IMAGE_PACKS[0];
}
