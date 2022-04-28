import cors from 'cors';
import express from 'express';
import { generateNonce, SiwcMessage } from 'siwc';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/nonce', function (_, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateNonce());
});

app.post('/verify', async function (req, res) {
    const { message, signature } = req.body;
    const siwcMessage = new SiwcMessage(message);
    try {
        await siwcMessage.validate(signature);
        res.send(true);
    } catch {
        res.send(false);
    }
});

app.listen(3000);
