import type { Shelf } from '$lib/types';
import { getAssetUrl } from '$lib/services/assets';

export const defaultShelves: Shelf[] = [
    {
        id: 'shelf-food',
        name: 'אוכל',
        color: '#F97316', // Orange
        boxes: [
            {
                id: 'box-sweets',
                name: 'ממתקים וחטיפים',
                color: '#F472B6', // Pink
                cards: [
                    { id: 'chocolate', word: 'שוקולד', imageUrl: getAssetUrl('cards/chocolate.png') },
                    { id: 'ice_cream', word: 'גלידה', imageUrl: getAssetUrl('cards/ice_cream.png') },
                    { id: 'cake', word: 'עוגה', imageUrl: getAssetUrl('cards/cake.png') },
                    { id: 'cookie', word: 'עוגייה', imageUrl: getAssetUrl('cards/cookie.png') },
                    { id: 'snack', word: 'חטיף', imageUrl: getAssetUrl('cards/snack.png') },
                    { id: 'pretzel', word: 'בייגלה', imageUrl: getAssetUrl('cards/pretzel.png') },
                    { id: 'bamba', word: 'במבה', imageUrl: getAssetUrl('cards/bamba.png') }
                ]
            },
            {
                id: 'box-fruits',
                name: 'פירות',
                color: '#84CC16', // Lime Green
                cards: [
                    { id: 'apple', word: 'תפוח', imageUrl: getAssetUrl('cards/apple.png') },
                    { id: 'banana', word: 'בננה', imageUrl: getAssetUrl('cards/banana.png') },
                    { id: 'orange', word: 'תפוז', imageUrl: getAssetUrl('cards/orange.png') },
                    { id: 'pear', word: 'אגס', imageUrl: getAssetUrl('cards/pear.png') },
                    { id: 'peach', word: 'אפרסק', imageUrl: getAssetUrl('cards/peach.png') },
                    { id: 'grapes', word: 'ענבים', imageUrl: getAssetUrl('cards/grapes.png') },
                    { id: 'watermelon', word: 'אבטיח', imageUrl: getAssetUrl('cards/watermelon.png') }
                ]
            },
            {
                id: 'box-vegetables',
                name: 'ירקות',
                color: '#10B981', // Emerald
                cards: [
                    { id: 'cucumber', word: 'מלפפון', imageUrl: getAssetUrl('cards/cucumber.png') },
                    { id: 'tomato', word: 'עגבנייה', imageUrl: getAssetUrl('cards/tomato.png') },
                    { id: 'pepper', word: 'פלפל', imageUrl: getAssetUrl('cards/pepper.png') },
                    { id: 'carrot', word: 'גזר', imageUrl: getAssetUrl('cards/carrot.png') },
                    { id: 'onion', word: 'בצל', imageUrl: getAssetUrl('cards/onion.png') },
                    { id: 'potato', word: 'תפוח אדמה', imageUrl: getAssetUrl('cards/potato.png') }
                ]
            },
            {
                id: 'box-meals',
                name: 'ארוחות',
                color: '#F59E0B', // Amber
                cards: [
                    { id: 'bread', word: 'לחם', imageUrl: getAssetUrl('cards/bread.png') },
                    { id: 'omelet', word: 'חביתה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'cheese', word: 'גבינה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'schnitzel', word: 'שניצל', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'rice', word: 'אורז', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'pasta', word: 'פסטה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'soup', word: 'מרק', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-drinks',
                name: 'שתייה',
                color: '#06B6D4', // Cyan
                cards: [
                    { id: 'water', word: 'מים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'juice', word: 'מיץ', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'milk', word: 'חלב', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'choco', word: 'שוקו', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'tea', word: 'תה', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            }
        ]
    },
    {
        id: 'shelf-people',
        name: 'אנשים',
        color: '#8B5CF6', // Purple
        boxes: [
            {
                id: 'box-family',
                name: 'משפחה',
                color: '#A78BFA', // Soft Purple
                cards: [
                    { id: 'dad', word: 'אבא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'mom', word: 'אמא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'grandpa', word: 'סבא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'grandma', word: 'סבתא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'uncle', word: 'דוד', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'aunt', word: 'דודה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'baby', word: 'תינוק', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-figures',
                name: 'דמויות',
                color: '#818CF8', // Indigo
                cards: [
                    { id: 'boy', word: 'ילד', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'girl', word: 'ילדה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'friend_m', word: 'חבר', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'friend_f', word: 'חברה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'teacher_m', word: 'מורה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'kindergarten_teacher', word: 'גננת', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            }
        ]
    },
    {
        id: 'shelf-objects',
        name: 'חפצים',
        color: '#3B82F6', // Blue
        boxes: [
            {
                id: 'box-kitchenware',
                name: 'כלי אוכל',
                color: '#94A3B8', // Slate
                cards: [
                    { id: 'plate', word: 'צלחת', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'cup', word: 'כוס', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'spoon', word: 'כף', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'teaspoon', word: 'כפית', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'fork', word: 'מזלג', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'knife', word: 'סכין', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-furniture',
                name: 'רהיטים',
                color: '#D97706', // Brown/Amber
                cards: [
                    { id: 'table', word: 'שולחן', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'chair', word: 'כיסא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'bed', word: 'מיטה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'closet', word: 'ארון', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'sofa', word: 'ספה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'door', word: 'דלת', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-daily-equipment',
                name: 'ציוד יומיומי',
                color: '#38BDF8', // Sky
                cards: [
                    { id: 'bag', word: 'תיק', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'glasses', word: 'משקפיים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'phone', word: 'טלפון', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'computer', word: 'מחשב', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'key', word: 'מפתח', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'ball', word: 'כדור', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-crafts',
                name: 'יצירה וכתיבה',
                color: '#FB7185', // Rose
                cards: [
                    { id: 'paper', word: 'דף', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'pencil', word: 'עיפרון', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'marker', word: 'טוש', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'scissors', word: 'מספריים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'glue', word: 'דבק', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'paint', word: 'צבע', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            }
        ]
    },
    {
        id: 'shelf-clothes',
        name: 'בגדים',
        color: '#EC4899', // Pink
        boxes: [
            {
                id: 'box-clothing',
                name: 'לבוש בסיסי',
                color: '#E879F9', // Fuchsia
                cards: [
                    { id: 'shirt', word: 'חולצה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'pants', word: 'מכנסיים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'dress', word: 'שמלה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'skirt', word: 'חצאית', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'coat', word: 'מעיל', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'pajamas', word: 'פיג\'מה', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-footwear',
                name: 'הנעלה ואביזרים',
                color: '#2DD4BF', // Teal
                cards: [
                    { id: 'shoes', word: 'נעליים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'sandals', word: 'סנדלים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'boots', word: 'מגפיים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'socks', word: 'גרביים', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'hat', word: 'כובע', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            }
        ]
    },
    {
        id: 'shelf-concepts',
        name: 'מושגים ופעילויות',
        color: '#EAB308', // Yellow
        boxes: [
            {
                id: 'box-colors-warm',
                name: 'צבעים - חם/בהיר',
                color: '#FB923C', // Orange
                cards: [
                    { id: 'red', word: 'אדום', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'yellow', word: 'צהוב', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'orange_c', word: 'כתום', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'pink', word: 'ורוד', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'white', word: 'לבן', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-colors-cold',
                name: 'צבעים - קר/כהה',
                color: '#60A5FA', // Blue
                cards: [
                    { id: 'blue', word: 'כחול', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'green', word: 'ירוק', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'purple', word: 'סגול', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'brown', word: 'חום', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'black', word: 'שחור', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-communication',
                name: 'תקשורת ובקשות',
                color: '#A3E635', // Lime
                cards: [
                    { id: 'yes', word: 'כן', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'no', word: 'לא', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'thanks', word: 'תודה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'please', word: 'בבקשה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'more', word: 'עוד', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'enough', word: 'מספיק', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'want', word: 'רוצה', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'help', word: 'עזרה', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-actions',
                name: 'פעולות',
                color: '#F87171', // Red
                cards: [
                    { id: 'eat', word: 'לאכול', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'drink', word: 'לשתות', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'sleep', word: 'לישון', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'play', word: 'לשחק', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'walk', word: 'ללכת', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'sit', word: 'לשבת', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'draw', word: 'לצייר', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            },
            {
                id: 'box-days',
                name: 'ימות השבוע',
                color: '#6366F1', // Indigo
                cards: [
                    { id: 'sunday', word: 'יום ראשון', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'monday', word: 'יום שני', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'tuesday', word: 'יום שלישי', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'wednesday', word: 'יום רביעי', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'thursday', word: 'יום חמישי', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'friday', word: 'יום שישי', imageUrl: getAssetUrl('cards/placeholder_temp.png') },
                    { id: 'saturday', word: 'שבת', imageUrl: getAssetUrl('cards/placeholder_temp.png') }
                ]
            }
        ]
    }
];
