const key = 'AIzaSyDz3X_qfQe_28FEtMZwx3zizLwv27yJs7c';

export const videoList = [{
    fileId: '1Tgq4YMcgxtWBIvSl1ioSmZMibnoHZ8l9'
}, {
    fileId: '1PV8AztemNTZ8ghHRIK0hyJ9QzpFFHT2f'
}];

export const getVideoUrl = (fileId: string): string => {

    const url = new URL('https://www.googleapis.com');

    url.pathname = '/drive/v3/files/' + fileId;

    url.searchParams.append('alt', 'media');
    url.searchParams.append('key', key);

    return url.toString();
};

// https://www.googleapis.com/drive/v3/files/1xSgsuFbwWh9EcmwvbpqLN6ESUoLlNyks?alt=media&key=AIzaSyDz3X_qfQe_28FEtMZwx3zizLwv27yJs7c
