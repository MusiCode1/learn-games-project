(() => {

    const passKey = 'passkey';
    const textToEncrypt = 'text';
    window.encryptText(textToEncrypt, passKey, { aad: 'encrypt-algo:v1' }).then(encryptedText => {
        console.log('Encrypted Text:', encryptedText);
    }).catch(error => {
        console.error('Encryption Error:', error);
    });

})();