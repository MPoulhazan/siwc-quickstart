import cors from 'cors';
import express from 'express';
import { generateNonce, SiwcMessage, Space } from 'siwc';

const EXPOSED_PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors());

console.log(`Server is running on port ${EXPOSED_PORT}...`);

app.get('/nonce', function (_, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateNonce());
});

app.post('/verify', async function (req, res) {
    const { message, signature, space } = req.body;
    const siwcMessage = new SiwcMessage(message);
    const spaceEnum =
        space === 'core' ? Space.CONFLUX_CORE : Space.CONFLUX_E_SPACE;
    try {
        await siwcMessage.validate(signature, spaceEnum);
        res.send(true);
    } catch {
        res.send(false);
    }
});

app.listen(EXPOSED_PORT);
