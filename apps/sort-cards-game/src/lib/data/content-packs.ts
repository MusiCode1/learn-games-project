/**
 * חבילות תוכן מובנות למשחק מיון הכרטיסים
 */
import type { ContentPack } from "$lib/types";

/** חיות מול צמחים */
const animalsPlantsPack: ContentPack = {
  id: "animals-plants",
  name: "חיות וצמחים",
  description: "מיין את הכרטיסים לחיות או צמחים",
  icon: "🌿",
  rounds: [
    {
      id: "ap-1",
      title: "חיות או צמחים?",
      categories: [
        { id: "animals", name: "חיות", color: "#f59e0b", icon: "🐾" },
        { id: "plants", name: "צמחים", color: "#22c55e", icon: "🌱" },
      ],
      cards: [
        { id: "c1", content: "כלב", categoryId: "animals", image: "🐕" },
        { id: "c2", content: "שושנה", categoryId: "plants", image: "🌹" },
        { id: "c3", content: "חתול", categoryId: "animals", image: "🐈" },
        { id: "c4", content: "עץ אלון", categoryId: "plants", image: "🌳" },
        { id: "c5", content: "פרפר", categoryId: "animals", image: "🦋" },
        { id: "c6", content: "תפוח", categoryId: "plants", image: "🍎" },
        { id: "c7", content: "דג", categoryId: "animals", image: "🐟" },
        { id: "c8", content: "חמנייה", categoryId: "plants", image: "🌻" },
        { id: "c9", content: "ארנב", categoryId: "animals", image: "🐇" },
        { id: "c10", content: "קקטוס", categoryId: "plants", image: "🌵" },
      ],
    },
    {
      id: "ap-2",
      title: "עוד חיות וצמחים!",
      categories: [
        { id: "animals", name: "חיות", color: "#f59e0b", icon: "🐾" },
        { id: "plants", name: "צמחים", color: "#22c55e", icon: "🌱" },
      ],
      cards: [
        { id: "c11", content: "סוס", categoryId: "animals", image: "🐴" },
        { id: "c12", content: "ורד", categoryId: "plants", image: "🌷" },
        { id: "c13", content: "נשר", categoryId: "animals", image: "🦅" },
        { id: "c14", content: "דקל", categoryId: "plants", image: "🌴" },
        { id: "c15", content: "צב", categoryId: "animals", image: "🐢" },
        { id: "c16", content: "פטרייה", categoryId: "plants", image: "🍄" },
        { id: "c17", content: "דולפין", categoryId: "animals", image: "🐬" },
        { id: "c18", content: "תירס", categoryId: "plants", image: "🌽" },
      ],
    },
  ],
};

/** מספרים זוגיים ואי-זוגיים */
const oddEvenPack: ContentPack = {
  id: "odd-even",
  name: "זוגי ואי-זוגי",
  description: "מיין מספרים לזוגיים ואי-זוגיים",
  icon: "🔢",
  rounds: [
    {
      id: "oe-1",
      title: "זוגי או אי-זוגי?",
      categories: [
        { id: "even", name: "זוגי", color: "#3b82f6", icon: "2️⃣" },
        { id: "odd", name: "אי-זוגי", color: "#ef4444", icon: "1️⃣" },
      ],
      cards: [
        { id: "n1", content: "2", categoryId: "even" },
        { id: "n2", content: "7", categoryId: "odd" },
        { id: "n3", content: "4", categoryId: "even" },
        { id: "n4", content: "9", categoryId: "odd" },
        { id: "n5", content: "6", categoryId: "even" },
        { id: "n6", content: "3", categoryId: "odd" },
        { id: "n7", content: "10", categoryId: "even" },
        { id: "n8", content: "5", categoryId: "odd" },
        { id: "n9", content: "8", categoryId: "even" },
        { id: "n10", content: "1", categoryId: "odd" },
      ],
    },
  ],
};

/** צורות גיאומטריות */
const shapesPack: ContentPack = {
  id: "shapes-sorting",
  name: "מיון צורות",
  description: "מיין צורות לפי סוג",
  icon: "🔷",
  rounds: [
    {
      id: "sh-1",
      title: "עם פינות או בלי?",
      categories: [
        { id: "with-corners", name: "עם פינות", color: "#a855f7", icon: "📐" },
        { id: "no-corners", name: "בלי פינות", color: "#06b6d4", icon: "⭕" },
      ],
      cards: [
        { id: "s1", content: "ריבוע", categoryId: "with-corners", image: "🟧" },
        { id: "s2", content: "עיגול", categoryId: "no-corners", image: "🔵" },
        { id: "s3", content: "משולש", categoryId: "with-corners", image: "🔺" },
        { id: "s4", content: "אליפסה", categoryId: "no-corners", image: "🥚" },
        { id: "s5", content: "מלבן", categoryId: "with-corners", image: "🟩" },
        { id: "s6", content: "כוכב", categoryId: "with-corners", image: "⭐" },
      ],
    },
  ],
};

/** צבעים חמים וקרים */
const colorsPack: ContentPack = {
  id: "warm-cool-colors",
  name: "צבעים חמים וקרים",
  description: "מיין צבעים לחמים או קרים",
  icon: "🎨",
  rounds: [
    {
      id: "cc-1",
      title: "חם או קר?",
      categories: [
        { id: "warm", name: "חמים", color: "#ef4444", icon: "🔥" },
        { id: "cool", name: "קרים", color: "#3b82f6", icon: "❄️" },
      ],
      cards: [
        { id: "cl1", content: "אדום", categoryId: "warm", image: "🔴" },
        { id: "cl2", content: "כחול", categoryId: "cool", image: "🔵" },
        { id: "cl3", content: "כתום", categoryId: "warm", image: "🟠" },
        { id: "cl4", content: "ירוק", categoryId: "cool", image: "🟢" },
        { id: "cl5", content: "צהוב", categoryId: "warm", image: "🟡" },
        { id: "cl6", content: "סגול", categoryId: "cool", image: "🟣" },
      ],
    },
  ],
};

/** יש כוח - אין כוח (תנועה מול עיצור) */
const powerPack: ContentPack = {
  id: "yesh-koach",
  name: "יש כוח - אין כוח",
  description: "מיין אותיות — עם תנועה (כוח) או בלי",
  icon: "🔤",
  rounds: [
    {
      id: "yk-1",
      title: "יש כוח או אין כוח?",
      categories: [
        { id: "power", name: "יש כוח", color: "#e11d48", icon: "💪" },
        { id: "no-power", name: "אין כוח", color: "#6366f1", icon: "🪶" },
      ],
      cards: [
        // אותיות עם קמץ (יש כוח — יש תנועה)
        { id: "d1", content: "", categoryId: "power", image: "בָּ" },
        { id: "d2", content: "", categoryId: "power", image: "גָ" },
        { id: "d3", content: "", categoryId: "power", image: "דָּ" },
        { id: "d4", content: "", categoryId: "power", image: "כָּ" },
        { id: "d5", content: "", categoryId: "power", image: "פָ" },
        { id: "d6", content: "", categoryId: "power", image: "תָּ" },
        // אותיות בלי תנועה (אין כוח — עיצור)
        { id: "d7", content: "", categoryId: "no-power", image: "בּ" },
        { id: "d8", content: "", categoryId: "no-power", image: "ג" },
        { id: "d9", content: "", categoryId: "no-power", image: "דּ" },
        { id: "d10", content: "", categoryId: "no-power", image: "כּ" },
        { id: "d11", content: "", categoryId: "no-power", image: "פ" },
        { id: "d12", content: "", categoryId: "no-power", image: "ת" },
      ],
    },
    {
      id: "yk-2",
      title: "עוד תרגול — יש כוח או אין?",
      categories: [
        { id: "power", name: "יש כוח", color: "#e11d48", icon: "💪" },
        { id: "no-power", name: "אין כוח", color: "#6366f1", icon: "🪶" },
      ],
      cards: [
        // ערבוב דגושות ורפויות, עם ובלי תנועה
        { id: "d13", content: "", categoryId: "power", image: "כָ" },
        { id: "d14", content: "", categoryId: "no-power", image: "כ" },
        { id: "d15", content: "", categoryId: "power", image: "פָּ" },
        { id: "d16", content: "", categoryId: "no-power", image: "פּ" },
        { id: "d17", content: "", categoryId: "power", image: "בָ" },
        { id: "d18", content: "", categoryId: "no-power", image: "ב" },
        { id: "d19", content: "", categoryId: "power", image: "תָ" },
        { id: "d20", content: "", categoryId: "no-power", image: "תּ" },
        { id: "d21", content: "", categoryId: "power", image: "גָּ" },
        { id: "d22", content: "", categoryId: "no-power", image: "גּ" },
        { id: "d23", content: "", categoryId: "power", image: "דָ" },
        { id: "d24", content: "", categoryId: "no-power", image: "ד" },
      ],
    },
  ],
};

/** קבוצות מזון — 3 ארגזים */
const foodGroupsPack: ContentPack = {
  id: "food-groups",
  name: "קבוצות מזון",
  description: "מיין מזון לפירות, ירקות ודגנים",
  icon: "🍽️",
  rounds: [
    {
      id: "fg-1",
      title: "פרי, ירק או דגן?",
      categories: [
        { id: "fruit", name: "פירות", color: "#ef4444", icon: "🍎" },
        { id: "vegetable", name: "ירקות", color: "#22c55e", icon: "🥦" },
        { id: "grain", name: "דגנים", color: "#d97706", icon: "🌾" },
      ],
      cards: [
        { id: "f1", content: "תפוז", categoryId: "fruit", image: "🍊" },
        { id: "f2", content: "גזר", categoryId: "vegetable", image: "🥕" },
        { id: "f3", content: "לחם", categoryId: "grain", image: "🍞" },
        { id: "f4", content: "בננה", categoryId: "fruit", image: "🍌" },
        { id: "f5", content: "מלפפון", categoryId: "vegetable", image: "🥒" },
        { id: "f6", content: "אורז", categoryId: "grain", image: "🍚" },
        { id: "f7", content: "ענבים", categoryId: "fruit", image: "🍇" },
        { id: "f8", content: "עגבנייה", categoryId: "vegetable", image: "🍅" },
        { id: "f9", content: "פיתה", categoryId: "grain", image: "🫓" },
      ],
    },
  ],
};

// === רישום חבילות ===

export const ALL_CONTENT_PACKS: ContentPack[] = [
  powerPack,
  animalsPlantsPack,
  oddEvenPack,
  shapesPack,
  colorsPack,
  foodGroupsPack,
];

export function getPackById(id: string): ContentPack | undefined {
  return ALL_CONTENT_PACKS.find((p) => p.id === id);
}

export function getDefaultPack(): ContentPack {
  return ALL_CONTENT_PACKS[0];
}
