import type { Shelf } from '$lib/types';
const colors = {
	pink: '#F472B6',
	limeGreen: '#84CC16',
	emerald: '#10B981',
	amber: '#F59E0B',
	cyan: '#06B6D4',
	purple: '#8B5CF6',
	softPurple: '#A78BFA',
	indigo: '#818CF8',
	blue: '#3B82F6',
	softBlue: '#93C5FD',
	green: '#22C55E',
	softGreen: '#94D8B9',
	yellow: '#D97706',
	softYellow: '#FBBF24',
	red: '#EF4444',
	softRed: '#F56565',
	gray: '#9CA3AF',
	softGray: '#F97316',
	rose: '#FB923C',
	fuchsia: '#E879F9',
	sky: '#3B82F6',
	softSky: '#93C5FD',
	lime: '#84CC16',
	softLime: '#94D8B9',
	orange: '#F97316',
	softOrange: '#FBBF24'
};

export const defaultShelves: Shelf[] = [
	{
		id: 'shelf-food',
		name: 'אוכל',
		color: colors.orange,
		boxes: [
			{
				id: 'box-sweets',
				name: 'ממתקים וחטיפים',
				color: colors.pink,
				cards: [
					{ id: 'chocolate', word: 'שוקולד' },
					{ id: 'ice_cream', word: 'גלידה' },
					{ id: 'cake', word: 'עוגה' },
					{ id: 'cookie', word: 'עוגייה' },
					{ id: 'snack', word: 'חטיף' },
					{ id: 'pretzel', word: 'בייגלה' },
					{ id: 'bamba', word: 'במבה' }
				]
			},
			{
				id: 'box-fruits',
				name: 'פירות',
				color: colors.limeGreen,
				cards: [
					{ id: 'apple', word: 'תפוח' },
					{ id: 'banana', word: 'בננה' },
					{ id: 'orange', word: 'תפוז' },
					{ id: 'pear', word: 'אגס' },
					{ id: 'peach', word: 'אפרסק' },
					{ id: 'grapes', word: 'ענבים' },
					{ id: 'watermelon', word: 'אבטיח' }
				]
			},
			{
				id: 'box-vegetables',
				name: 'ירקות',
				color: colors.emerald,
				cards: [
					{ id: 'cucumber', word: 'מלפפון' },
					{ id: 'tomato', word: 'עגבנייה' },
					{ id: 'pepper', word: 'פלפל' },
					{ id: 'carrot', word: 'גזר' },
					{ id: 'onion', word: 'בצל' },
					{ id: 'potato', word: 'תפוח אדמה' }
				]
			},
			{
				id: 'box-meals',
				name: 'ארוחות',
				color: colors.amber,
				cards: [
					{ id: 'bread', word: 'לחם' },
					{ id: 'omelet', word: 'חביתה' },
					{ id: 'cheese', word: 'גבינה' },
					{ id: 'schnitzel', word: 'שניצל' },
					{ id: 'rice', word: 'אורז' },
					{ id: 'pasta', word: 'פסטה' },
					{ id: 'soup', word: 'מרק' }
				]
			},
			{
				id: 'box-drinks',
				name: 'שתייה',
				color: colors.cyan,
				cards: [
					{ id: 'water', word: 'מים' },
					{ id: 'juice', word: 'מיץ' },
					{ id: 'milk', word: 'חלב' },
					{ id: 'choco', word: 'שוקו' },
					{ id: 'tea', word: 'תה' }
				]
			}
		]
	},
	{
		id: 'shelf-people',
		name: 'אנשים',
		color: colors.purple,
		boxes: [
			{
				id: 'box-family',
				name: 'משפחה',
				color: colors.softPurple,
				cards: [
					{ id: 'dad', word: 'אבא' },
					{ id: 'mom', word: 'אמא' },
					{ id: 'grandpa', word: 'סבא' },
					{ id: 'grandma', word: 'סבתא' },
					{ id: 'uncle', word: 'דוד' },
					{ id: 'aunt', word: 'דודה' },
					{ id: 'baby', word: 'תינוק' }
				]
			},
			{
				id: 'box-figures',
				name: 'דמויות',
				color: colors.indigo,
				cards: [
					{ id: 'boy', word: 'ילד' },
					{ id: 'girl', word: 'ילדה' },
					{ id: 'friend_m', word: 'חבר' },
					{ id: 'friend_f', word: 'חברה' },
					{ id: 'teacher_m', word: 'מורה' },
					{
						id: 'kindergarten_teacher',
						word: 'גננת'
					}
				]
			}
		]
	},
	{
		id: 'shelf-objects',
		name: 'חפצים',
		color: colors.blue,
		boxes: [
			{
				id: 'box-kitchenware',
				name: 'כלי אוכל',
				color: colors.softBlue,
				cards: [
					{ id: 'plate', word: 'צלחת' },
					{ id: 'cup', word: 'כוס' },
					{ id: 'spoon', word: 'כף' },
					{ id: 'teaspoon', word: 'כפית' },
					{ id: 'fork', word: 'מזלג' },
					{ id: 'knife', word: 'סכין' }
				]
			},
			{
				id: 'box-furniture',
				name: 'רהיטים',
				color: colors.softBlue,
				cards: [
					{ id: 'table', word: 'שולחן' },
					{ id: 'chair', word: 'כיסא' },
					{ id: 'bed', word: 'מיטה' },
					{ id: 'closet', word: 'ארון' },
					{ id: 'sofa', word: 'ספה' },
					{ id: 'door', word: 'דלת' }
				]
			},
			{
				id: 'box-daily-equipment',
				name: 'ציוד יומיומי',
				color: colors.sky,
				cards: [
					{ id: 'bag', word: 'תיק' },
					{ id: 'glasses', word: 'משקפיים' },
					{ id: 'phone', word: 'טלפון' },
					{ id: 'computer', word: 'מחשב' },
					{ id: 'key', word: 'מפתח' },
					{ id: 'ball', word: 'כדור' }
				]
			},
			{
				id: 'box-crafts',
				name: 'יצירה וכתיבה',
				color: colors.rose,
				cards: [
					{ id: 'paper', word: 'דף' },
					{ id: 'pencil', word: 'עיפרון' },
					{ id: 'marker', word: 'טוש' },
					{ id: 'scissors', word: 'מספריים' },
					{ id: 'glue', word: 'דבק' },
					{ id: 'paint', word: 'צבע' }
				]
			}
		]
	},
	{
		id: 'shelf-clothes',
		name: 'בגדים',
		color: colors.pink,
		boxes: [
			{
				id: 'box-clothing',
				name: 'לבוש בסיסי',
				color: '#E879F9', // Fuchsia
				cards: [
					{ id: 'shirt', word: 'חולצה' },
					{ id: 'pants', word: 'מכנסיים' },
					{ id: 'dress', word: 'שמלה' },
					{ id: 'skirt', word: 'חצאית' },
					{ id: 'coat', word: 'מעיל' },
					{ id: 'pajamas', word: "פיג'מה" }
				]
			},
			{
				id: 'box-footwear',
				name: 'הנעלה ואביזרים',
				color: '#2DD4BF', // Teal
				cards: [
					{ id: 'shoes', word: 'נעליים' },
					{ id: 'sandals', word: 'סנדלים' },
					{ id: 'boots', word: 'מגפיים' },
					{ id: 'socks', word: 'גרביים' },
					{ id: 'hat', word: 'כובע' }
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
				color: colors.orange,
				cards: [
					{ id: 'red', word: 'אדום' },
					{ id: 'yellow', word: 'צהוב' },
					{ id: 'orange_c', word: 'כתום' },
					{ id: 'pink', word: 'ורוד' },
					{ id: 'white', word: 'לבן' }
				]
			},
			{
				id: 'box-colors-cold',
				name: 'צבעים - קר/כהה',
				color: colors.blue, // Blue
				cards: [
					{ id: 'blue', word: 'כחול' },
					{ id: 'green', word: 'ירוק' },
					{ id: 'purple', word: 'סגול' },
					{ id: 'brown', word: 'חום' },
					{ id: 'black', word: 'שחור' }
				]
			},
			{
				id: 'box-communication',
				name: 'תקשורת ובקשות',
				color: colors.lime,
				cards: [
					{ id: 'yes', word: 'כן' },
					{ id: 'no', word: 'לא' },
					{ id: 'thanks', word: 'תודה' },
					{ id: 'please', word: 'בבקשה' },
					{ id: 'more', word: 'עוד' },
					{ id: 'enough', word: 'מספיק' },
					{ id: 'want', word: 'רוצה' },
					{ id: 'help', word: 'עזרה' }
				]
			},
			{
				id: 'box-actions',
				name: 'פעולות',
				color: colors.red,
				cards: [
					{ id: 'eat', word: 'לאכול' },
					{ id: 'drink', word: 'לשתות' },
					{ id: 'sleep', word: 'לישון' },
					{ id: 'play', word: 'לשחק' },
					{ id: 'walk', word: 'ללכת' },
					{ id: 'sit', word: 'לשבת' },
					{ id: 'draw', word: 'לצייר' }
				]
			},
			{
				id: 'box-days',
				name: 'ימות השבוע',
				color: colors.indigo,
				cards: [
					{ id: 'sunday', word: 'יום ראשון' },
					{ id: 'monday', word: 'יום שני' },
					{ id: 'tuesday', word: 'יום שלישי' },
					{
						id: 'wednesday',
						word: 'יום רביעי'
					},
					{
						id: 'thursday',
						word: 'יום חמישי'
					},
					{ id: 'friday', word: 'יום שישי' },
					{ id: 'saturday', word: 'שבת' }
				]
			}
		]
	}
];
