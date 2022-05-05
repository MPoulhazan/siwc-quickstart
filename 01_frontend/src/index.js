import { ethers } from 'ethers';
import { SiwcMessage, getCIP23DomainMessage, Space } from 'siwc';

let messageESpaceSignature = '';
let messageConfluxCoreSignature = '';
let messageContent = null;

const domain = window.location.host;
const origin = window.location.origin;
const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
const signer = ethProvider.getSigner();
const DEFAULT_MESSAGE = 'Sign in with Conflux to the app.';

/**
 *
 * @param {string} address: Wallet adress
 * @param {string} statement: Action statement readable for user
 * @returns Message in string
 */
function createSiwcMessage(address, statement, networkId) {
    const message = new SiwcMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: networkId,
    });
    messageContent = message;
    return message.prepareMessage();
}

/**
 * Connect to Conflux eSpace
 */
function connectMetamaskWallet() {
    ethProvider
        .send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

/**
 * Connect to Conflux Core
 */
async function connectFluentWallet() {
    if (!isFluentInstalled()) {
        console.error('Please install Fluent Wallet');
        return;
    }
    window.conflux
        .request({ method: `cfx_requestAccounts` })
        .catch((err) => console.error(err));
}

/**
 * Check if fluent is installed on browser
 * @returns true if fluent is installed
 */
function isFluentInstalled() {
    return Boolean(window?.conflux?.isFluent);
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

/**
 * Sign in with conflux eSpace on Metamask
 */
async function signInWithESpace() {
    const message = createSiwcMessage(
        await signer.getAddress(),
        DEFAULT_MESSAGE,
        await getNetworkId(Space.CONFLUX_E_SPACE)
    );
    messageESpaceSignature = await signer.signMessage(message);
}

/**
 * Sign in with Conflux Core on Fluent
 */
async function signInWithConfluxCore() {
    const account = await getConfluxAccountInfos();
    const chainId = await getNetworkId(Space.CONFLUX_CORE);
    const message = createSiwcMessage(account[0], DEFAULT_MESSAGE, chainId);

    // Format message to CIP23
    const typedData = JSON.stringify(
        getCIP23DomainMessage(message, domain, chainId)
    );
    // Sign Message
    window.conflux
        .request({
            method: `cfx_signTypedData_v4`,
            params: [account[0], typedData],
        })
        .then((signature) => {
            messageConfluxCoreSignature = signature;
        })
        .catch((err) => console.error(err));
}

// TODO Delete ?
function verifyConfluxLogin() {
    messageContent
        .validate(messageESpaceSignature, Space.CONFLUX_E_SPACE)
        .then((res) => {
            console.log('Contract response ', res);
        });
}
async function verifyFluentLogin() {
    messageContent
        .validate(messageConfluxCoreSignature, Space.CONFLUX_CORE)
        .then((res) => {
            console.log('Contract response ', res);
        });
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

const connectWalletBtn = document.getElementById('connectWalletBtn');
const connectCfxWalletBtn = document.getElementById('connectCfxWalletBtn');
const siwcBtn = document.getElementById('siwcBtn');
const siwcFluentBtn = document.getElementById('siwcFluentBtn');
const verifyMmBtn = document.getElementById('verifyMmBtn');
const verifyFtBtn = document.getElementById('verifyFtBtn');
connectWalletBtn.onclick = connectMetamaskWallet;
connectCfxWalletBtn.onclick = connectFluentWallet;
siwcBtn.onclick = signInWithESpace;
siwcFluentBtn.onclick = signInWithConfluxCore;
verifyMmBtn.onclick = verifyConfluxLogin;
verifyFtBtn.onclick = verifyFluentLogin;
