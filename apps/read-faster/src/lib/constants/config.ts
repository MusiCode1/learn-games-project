export const CONFIG = {
  cloudinary: {
    cloudName: 'your-cloud-name',
    folder: 'words',
    defaultFormat: 'webp',
    defaultSize: '300x300'
  },
  app: {
    defaultWordsPerSet: 5,
    minWordsPerSet: 1,
    maxWordsPerSet: 10,
    defaultRepetitions: 1,
    minRepetitions: 1,
    maxRepetitions: 5,
    transitionDuration: 500,
    defaultHideSeconds: 3,
    minHideSeconds: 1,
    maxHideSeconds: 10
  }
};
