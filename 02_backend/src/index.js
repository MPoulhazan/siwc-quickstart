import cors from 'cors';
import express from 'express';
import { generateNonce, SiwcMessage } from 'siwc';

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
    const { message, signature } = req.body;
    const siwcMessage = new SiwcMessage(message);
    try {
        await siwcMessage.validate(signature, Space.CONFLUX_E_SPACE);
        res.send(true);
    } catch {
        res.send(false);
    }
});

app.listen(EXPOSED_PORT);
