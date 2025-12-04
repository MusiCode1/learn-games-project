export interface WordData {
    id: string;
    word: string;
    imageUrl: string;
}

export const words: WordData[] = [
    {
        id: '1',
        word: 'כלב',
        imageUrl: 'https://placehold.co/400x400?text=Dog', // Placeholder
    },
    {
        id: '2',
        word: 'חתול',
        imageUrl: 'https://placehold.co/400x400?text=Cat', // Placeholder
    },
    {
        id: '3',
        word: 'בית',
        imageUrl: 'https://placehold.co/400x400?text=House', // Placeholder
    },
    {
        id: '4',
        word: 'כדור',
        imageUrl: 'https://placehold.co/400x400?text=Ball', // Placeholder
    },
    {
        id: '5',
        word: 'פרח',
        imageUrl: 'https://placehold.co/400x400?text=Flower', // Placeholder
    }
];
