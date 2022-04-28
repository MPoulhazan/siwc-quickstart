const siwc = require('siwc');

const domain = 'localhost';
const origin = 'https://localhost/login';

function createSiwcMessage(address, statement) {
    const siwcMessage = new siwc.SiwcMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '1',
    });
    return siwcMessage.prepareMessage();
}

console.log(
    createSiwcMessage(
        '0x051c5424039da91c52c55df5d785385aab073dcf',
        'This is a test statement.'
    )
);
