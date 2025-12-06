import type { Shelf } from '$lib/types';

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
                    { id: 'chocolate', word: 'שוקולד', imageUrl: '/images/shelf_food/sweets/chocolate.png' },
                    { id: 'ice_cream', word: 'גלידה', imageUrl: '/images/shelf_food/sweets/ice_cream.png' },
                    { id: 'cake', word: 'עוגה', imageUrl: '/images/shelf_food/sweets/cake.png' },
                    { id: 'cookie', word: 'עוגייה', imageUrl: '/images/shelf_food/sweets/cookie.png' },
                    { id: 'snack', word: 'חטיף', imageUrl: '/images/shelf_food/sweets/snack.png' },
                    { id: 'pretzel', word: 'בייגלה', imageUrl: '/images/shelf_food/sweets/pretzel.png' },
                    { id: 'bamba', word: 'במבה', imageUrl: '/images/shelf_food/sweets/bamba.png' }
                ]
            },
            {
                id: 'box-fruits',
                name: 'פירות',
                color: '#84CC16', // Lime Green
                cards: [
                    { id: 'apple', word: 'תפוח', imageUrl: '/images/shelf_food/fruits/apple.png' },
                    { id: 'banana', word: 'בננה', imageUrl: '/images/shelf_food/fruits/banana.png' },
                    { id: 'orange', word: 'תפוז', imageUrl: '/images/shelf_food/fruits/orange.png' },
                    { id: 'pear', word: 'אגס', imageUrl: '/images/shelf_food/fruits/pear.png' },
                    { id: 'peach', word: 'אפרסק', imageUrl: '/images/shelf_food/fruits/peach.png' },
                    { id: 'grapes', word: 'ענבים', imageUrl: '/images/shelf_food/fruits/grapes.png' },
                    { id: 'watermelon', word: 'אבטיח', imageUrl: '/images/shelf_food/fruits/watermelon.png' }
                ]
            },
            {
                id: 'box-vegetables',
                name: 'ירקות',
                color: '#10B981', // Emerald
                cards: [
                    { id: 'cucumber', word: 'מלפפון', imageUrl: '/images/shelf_food/vegetables/cucumber.png' },
                    { id: 'tomato', word: 'עגבנייה', imageUrl: '/images/shelf_food/vegetables/tomato.png' },
                    { id: 'pepper', word: 'פלפל', imageUrl: '/images/shelf_food/vegetables/pepper.png' },
                    { id: 'carrot', word: 'גזר', imageUrl: '/images/shelf_food/vegetables/carrot.png' },
                    { id: 'onion', word: 'בצל', imageUrl: '/images/shelf_food/vegetables/onion.png' },
                    { id: 'potato', word: 'תפוח אדמה', imageUrl: '/images/shelf_food/vegetables/potato.png' }
                ]
            },
            {
                id: 'box-meals',
                name: 'ארוחות',
                color: '#F59E0B', // Amber
                cards: [
                    { id: 'bread', word: 'לחם', imageUrl: '/images/shelf_food/meals/bread.png' },
                    { id: 'omelet', word: 'חביתה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'cheese', word: 'גבינה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'schnitzel', word: 'שניצל', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'rice', word: 'אורז', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'pasta', word: 'פסטה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'soup', word: 'מרק', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-drinks',
                name: 'שתייה',
                color: '#06B6D4', // Cyan
                cards: [
                    { id: 'water', word: 'מים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'juice', word: 'מיץ', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'milk', word: 'חלב', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'choco', word: 'שוקו', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'tea', word: 'תה', imageUrl: '/images/placeholder_temp.png' }
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
                    { id: 'dad', word: 'אבא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'mom', word: 'אמא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'grandpa', word: 'סבא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'grandma', word: 'סבתא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'uncle', word: 'דוד', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'aunt', word: 'דודה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'baby', word: 'תינוק', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-figures',
                name: 'דמויות',
                color: '#818CF8', // Indigo
                cards: [
                    { id: 'boy', word: 'ילד', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'girl', word: 'ילדה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'friend_m', word: 'חבר', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'friend_f', word: 'חברה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'teacher_m', word: 'מורה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'kindergarten_teacher', word: 'גננת', imageUrl: '/images/placeholder_temp.png' }
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
                    { id: 'plate', word: 'צלחת', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'cup', word: 'כוס', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'spoon', word: 'כף', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'teaspoon', word: 'כפית', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'fork', word: 'מזלג', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'knife', word: 'סכין', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-furniture',
                name: 'רהיטים',
                color: '#D97706', // Brown/Amber
                cards: [
                    { id: 'table', word: 'שולחן', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'chair', word: 'כיסא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'bed', word: 'מיטה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'closet', word: 'ארון', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'sofa', word: 'ספה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'door', word: 'דלת', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-daily-equipment',
                name: 'ציוד יומיומי',
                color: '#38BDF8', // Sky
                cards: [
                    { id: 'bag', word: 'תיק', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'glasses', word: 'משקפיים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'phone', word: 'טלפון', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'computer', word: 'מחשב', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'key', word: 'מפתח', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'ball', word: 'כדור', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-crafts',
                name: 'יצירה וכתיבה',
                color: '#FB7185', // Rose
                cards: [
                    { id: 'paper', word: 'דף', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'pencil', word: 'עיפרון', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'marker', word: 'טוש', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'scissors', word: 'מספריים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'glue', word: 'דבק', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'paint', word: 'צבע', imageUrl: '/images/placeholder_temp.png' }
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
                    { id: 'shirt', word: 'חולצה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'pants', word: 'מכנסיים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'dress', word: 'שמלה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'skirt', word: 'חצאית', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'coat', word: 'מעיל', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'pajamas', word: 'פיג\'מה', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-footwear',
                name: 'הנעלה ואביזרים',
                color: '#2DD4BF', // Teal
                cards: [
                    { id: 'shoes', word: 'נעליים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'sandals', word: 'סנדלים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'boots', word: 'מגפיים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'socks', word: 'גרביים', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'hat', word: 'כובע', imageUrl: '/images/placeholder_temp.png' }
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
                    { id: 'red', word: 'אדום', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'yellow', word: 'צהוב', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'orange_c', word: 'כתום', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'pink', word: 'ורוד', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'white', word: 'לבן', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-colors-cold',
                name: 'צבעים - קר/כהה',
                color: '#60A5FA', // Blue
                cards: [
                    { id: 'blue', word: 'כחול', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'green', word: 'ירוק', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'purple', word: 'סגול', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'brown', word: 'חום', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'black', word: 'שחור', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-communication',
                name: 'תקשורת ובקשות',
                color: '#A3E635', // Lime
                cards: [
                    { id: 'yes', word: 'כן', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'no', word: 'לא', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'thanks', word: 'תודה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'please', word: 'בבקשה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'more', word: 'עוד', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'enough', word: 'מספיק', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'want', word: 'רוצה', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'help', word: 'עזרה', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-actions',
                name: 'פעולות',
                color: '#F87171', // Red
                cards: [
                    { id: 'eat', word: 'לאכול', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'drink', word: 'לשתות', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'sleep', word: 'לישון', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'play', word: 'לשחק', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'walk', word: 'ללכת', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'sit', word: 'לשבת', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'draw', word: 'לצייר', imageUrl: '/images/placeholder_temp.png' }
                ]
            },
            {
                id: 'box-days',
                name: 'ימות השבוע',
                color: '#6366F1', // Indigo
                cards: [
                    { id: 'sunday', word: 'יום ראשון', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'monday', word: 'יום שני', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'tuesday', word: 'יום שלישי', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'wednesday', word: 'יום רביעי', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'thursday', word: 'יום חמישי', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'friday', word: 'יום שישי', imageUrl: '/images/placeholder_temp.png' },
                    { id: 'saturday', word: 'שבת', imageUrl: '/images/placeholder_temp.png' }
                ]
            }
        ]
    }
];
