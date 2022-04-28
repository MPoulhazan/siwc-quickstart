import { ethers } from 'ethers';
import { SiwcMessage } from 'siwc';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const BACKEND_ADDR = 'http://localhost:3000';
async function createSiwcMessage(address, statement) {
    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
        credentials: 'include',
    });
    const message = new SiwcMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '1',
        nonce: await res.text(),
    });
    return message.prepareMessage();
}

function connectWallet() {
    provider
        .send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

async function signInWithConfluxEspace() {
    const message = await createSiwcMessage(
        await signer.getAddress(),
        'Sign in with Conflux to the app.'
    );
    const signature = await signer.signMessage(message);

    const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include',
    });
    console.log(await res.text());
}

async function getInformation() {
    const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
        credentials: 'include',
    });
    console.log(await res.text());
}

const connectWalletBtn = document.getElementById('connectWalletBtn');
const siwcBtn = document.getElementById('siwcBtn');
const infoBtn = document.getElementById('infoBtn');
connectWalletBtn.onclick = connectWallet;
siwcBtn.onclick = signInWithConfluxEspace;
infoBtn.onclick = getInformation;
