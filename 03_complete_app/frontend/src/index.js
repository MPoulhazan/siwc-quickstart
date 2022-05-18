import { ethers } from 'ethers';
// @ts-ignore
import { SiwcMessage, Space } from 'siwc';

// Template
const connectESpaceWalletBtn = document.getElementById(
    'connectESpaceWalletBtn'
);
const siwcESpaceBtn = document.getElementById('siwcESpaceBtn');
const infoBtn = document.getElementById('infoBtn');
const connectCoreWalletBtn = document.getElementById('connectCoreWalletBtn');
const siwcCoreBtn = document.getElementById('siwcCoreBtn');

// Params
const domain = window.location.host;
const origin = window.location.origin;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const today = new Date();

const BACKEND_ADDR = 'http://localhost:3000';
const SIGNIN_VALIDITY_END_DAYS = 1; // Expire tomorrow
const SIGNIN_VALIDITY_START_DAYS = 1; // valid since 1 day

async function createSiwcMessage(address, statement, networkId) {
    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
        credentials: 'include',
    });
    const message = new SiwcMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: networkId || 1,
        nonce: await res.text(),
        expirationTime: new Date(
            today.setDate(today.getDate() + SIGNIN_VALIDITY_END_DAYS)
        ).toISOString(),
        notBefore: new Date(
            today.setDate(today.getDate() + SIGNIN_VALIDITY_START_DAYS)
        ).toISOString(),
    });
    return message.prepareMessage();
}

function connectESpaceWallet() {
    provider
        .send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

function connectCoreWallet() {
    if (!isFluentInstalled()) {
        console.error('Please install Fluent Wallet');
        return;
    }
    window.conflux
        .request({ method: `cfx_requestAccounts` })
        .catch((err) => console.error(err));
}

async function signInWithConfluxEspace() {
    const message = await createSiwcMessage(
        await signer.getAddress(),
        'Sign in with Conflux to the app.'
    );
    const signature = await signer.signMessage(message);

    fetchVerify(message, signature, 'space');
}

async function signInWithConfluxCore() {
    const account = await getConfluxAccountInfos();
    const chainId = await getNetworkId(Space.CONFLUX_CORE);

    const message = await createSiwcMessage(
        account[0],
        'Sign in with Conflux to the app.',
        chainId
    );

    const signature = // Sign Message
        await window.conflux.request({
            method: `personal_sign`,
            params: [message, account[0]],
        });

    fetchVerify(message, signature, 'core');
}

function fetchVerify(message, signature, space) {
    fetch(`${BACKEND_ADDR}/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature, space }),
        credentials: 'include',
    });
}

async function getSessionInformation() {
    const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
        credentials: 'include',
    });
    console.log(await res.text());
}

/**
 * Get the Fluent wallet informations
 * @returns Current Fulent wallet address
 */
async function getConfluxAccountInfos() {
    return window.conflux
        .request({ method: `cfx_accounts` })
        .catch((err) => console.error(err));
}

async function getNetworkId(walletType) {
    // @ts-ignore
    return !walletType || Space.CONFLUX_E_SPACE
        ? Promise.resolve(1)
        : window.conflux
              .request({
                  method: `cfx_getStatus`,
                  params: [],
              })
              .then((res) => {
                  return parseInt(res.networkId, 16);
              })
              .catch((err) => console.error(err));
}

/**
 * Check if fluent is installed on browser
 * @returns true if fluent is installed
 */
function isFluentInstalled() {
    return Boolean(window?.conflux?.isFluent);
}

// eSpace
connectESpaceWalletBtn.onclick = connectESpaceWallet;
siwcESpaceBtn.onclick = signInWithConfluxEspace;
infoBtn.onclick = getSessionInformation;

// Core
connectCoreWalletBtn.onclick = connectCoreWallet;
siwcCoreBtn.onclick = signInWithConfluxCore;
