export interface WordData {
    id: string;
    word: string;
    imageUrl: string;
}

export const words: WordData[] = [
    {
        id: '1',
        word: 'כלב',
        imageUrl: '/images/dog.png',
    },
    {
        id: '2',
        word: 'חתול',
        imageUrl: '/images/cat.png',
    },
    {
        id: '3',
        word: 'בית',
        imageUrl: '/images/house.png',
    },
    {
        id: '4',
        word: 'כדור',
        imageUrl: '/images/ball.png',
    },
    {
        id: '5',
        word: 'פרח',
        imageUrl: '/images/flower.png',
    }
];
