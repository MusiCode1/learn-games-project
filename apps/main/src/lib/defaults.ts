import type { CategoryTextKey, GameTextKey, StatusTextKey } from './services/language';

export interface AvailableGame {
	id: GameTextKey;
	category: CategoryTextKey;
	status: StatusTextKey;
	href: string;
	devHref?: string;
	appPath: string;
	icon: string;
	accent: string;
}

export const AVAILABLE_GAMES: AvailableGame[] = [
	{
		id: 'wordys',
		category: 'reading',
		status: 'available',
		href: 'https://wordys-game.pages.dev',
		devHref: 'https://dev.wordys-game.pages.dev',
		appPath: 'apps/wordys-game',
		icon: 'אב',
		accent: 'rose'
	},
	{
		id: 'readFaster',
		category: 'reading',
		status: 'available',
		href: 'https://read-faster-tzlev.vercel.app',
		appPath: 'apps/read-faster',
		icon: 'רץ',
		accent: 'sky'
	},
	{
		id: 'sortCards',
		category: 'thinking',
		status: 'available',
		href: 'https://sort-cards-game.pages.dev',
		appPath: 'apps/sort-cards-game',
		icon: 'מיון',
		accent: 'emerald'
	},
	{
		id: 'trainAddition',
		category: 'math',
		status: 'available',
		href: 'https://train-addition-game.pages.dev',
		devHref: 'https://dev.train-addition-game.pages.dev',
		appPath: 'apps/train-addition-game',
		icon: '+',
		accent: 'amber'
	},
	{
		id: 'passcodePractice',
		category: 'lifeSkills',
		status: 'available',
		href: 'https://passcode-practice.pages.dev',
		devHref: 'https://dev.passcode-practice.pages.dev',
		appPath: 'apps/passcode-practice',
		icon: '123',
		accent: 'violet'
	},
	{
		id: 'lotto',
		category: 'memory',
		status: 'available',
		href: 'https://lotto-game.pages.dev',
		appPath: 'apps/lotto-game',
		icon: 'זכר',
		accent: 'teal'
	},
	{
		id: 'jigsawPuzzle',
		category: 'visual',
		status: 'available',
		href: 'https://puzzle-game-92p.pages.dev',
		devHref: 'https://dev.puzzle-game-92p.pages.dev',
		appPath: 'apps/jigsaw-puzzle-game/version-2',
		icon: 'חלק',
		accent: 'indigo'
	},
	{
		id: 'findLetter',
		category: 'reading',
		status: 'available',
		href: 'https://find-letter-game.pages.dev',
		devHref: 'https://dev.find-letter-game.pages.dev',
		appPath: 'apps/find-letter-game',
		icon: 'בַּ',
		accent: 'rose'
	}
];
