import { ethers } from 'ethers';
import { SiwcMessage, getCIP23DomainMessage, WalletType } from 'siwc';

let messageESpaceSignature = '';
let messageConfluxCoreSignature = '';
let messageContent = null;

const domain = window.location.host;
const origin = window.location.origin;
const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
const signer = ethProvider.getSigner();

function createSiwcMessage(address, statement) {
    const message = new SiwcMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '1030',
    });
    messageContent = message;
    return message.prepareMessage();
}

/**
 * Connect to Metamask
 */
function connectMetamaskWallet() {
    ethProvider
        .send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

/**
 * Connect to Conflux
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
async function signInWithConfluxeSpace() {
    const message = createSiwcMessage(
        await signer.getAddress(),
        'Sign in with Conflux to the app.'
    );
    messageESpaceSignature = await signer.signMessage(message);
}

/**
 * Sign in with Conflux Core on Fluent
 */
async function signInWithConfluxCore() {
    getConfluxAccountInfos().then((account) => {
        const accountKey = account[0];
        const message = createSiwcMessage(
            accountKey,
            'Sign in with Conflux to the app.'
        );

        const typedData = getCIP23DomainMessage(message, domain);

        // Stringify typeData
        const typedDataString = JSON.stringify(typedData);

        // Sign Message
        window.conflux
            .request({
                method: `cfx_signTypedData_v4`,
                params: [accountKey, typedDataString],
            })
            .then((signature) => {
                messageConfluxCoreSignature = signature;
            })
            .catch((err) => console.error(err));
    });
}

// TODO Delete ?
function verifyConfluxLogin() {
    console.log('Verify message : ', messageContent);
    console.log('Verify signature ', messageESpaceSignature);
    messageContent
        .validate(messageESpaceSignature, WalletType.METAMASK)
        .then((res) => {
            console.log('Contract response ', res);
        });
}
function verifyFluentLogin() {
    console.log('Verify message : ', messageContent);
    console.log('Verify signature ', messageConfluxCoreSignature);
    messageContent
        .validate(messageConfluxCoreSignature, WalletType.FLUENT)
        .then((res) => {
            console.log('Contract response ', res);
        });
}

const connectWalletBtn = document.getElementById('connectWalletBtn');
const connectCfxWalletBtn = document.getElementById('connectCfxWalletBtn');
const siwcBtn = document.getElementById('siwcBtn');
const siwcFluentBtn = document.getElementById('siwcFluentBtn');
const verifyMmBtn = document.getElementById('verifyMmBtn');
const verifyFtBtn = document.getElementById('verifyFtBtn');
connectWalletBtn.onclick = connectMetamaskWallet;
connectCfxWalletBtn.onclick = connectFluentWallet;
siwcBtn.onclick = signInWithConfluxeSpace;
siwcFluentBtn.onclick = signInWithConfluxCore;
verifyMmBtn.onclick = verifyConfluxLogin;
verifyFtBtn.onclick = verifyFluentLogin;
