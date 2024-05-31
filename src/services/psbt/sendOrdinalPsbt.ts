import {
    Psbt,
    networks,
    payments,
    script,
    initEccLib,
    crypto,
    address as Address,
} from "bitcoinjs-lib";
import { ISendingOrdinalData, IUtxo } from "../../utils/types";
import { toXOnly } from "../../utils/buffer";
import networkConfig, { SEND_UTXO_FEE_LIMIT, TESTNET } from "../../config/network.config";
import wallet from "../wallet/initializeWallet";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory, ECPairAPI } from "ecpair";
import { getUtxos } from "../../utils/mempool";
import { getSendBTCUTXOArray } from "../../services/utxo/utxo.management";
import { OrdinalsUtxoSendPsbt } from "../../services/utxo/utxo.ordinalsSendPsbt";

initEccLib(ecc as any);
const ECPair: ECPairAPI = ECPairFactory(ecc);

export const sendOrdinalBTCPsbt = async (sendingOrdinalData: ISendingOrdinalData): Promise<any> => {

    const network = networkConfig.networkType == TESTNET ? networks.testnet : networks.bitcoin;
    const keyPair = wallet.ecPair;

    // const utxos = await getBtcUtxoInfo(wallet.address, networkType)
    let utxos = await getUtxos(sendingOrdinalData.receiveAddress, networkConfig.networkType)
    utxos = utxos.filter((utxo: IUtxo, index: number) => utxo.value > 5000)

    let response = getSendBTCUTXOArray(utxos, sendingOrdinalData.btcAmount + SEND_UTXO_FEE_LIMIT);
    if (!response.isSuccess) {
        return { isSuccess: false, data: 'No enough balance on admin wallet.' };
    }

    let selectedUtxos = response.data;
    let redeemFee = SEND_UTXO_FEE_LIMIT;

    for (let i = 0; i < 3; i++) {
        let redeemPsbt: Psbt = await OrdinalsUtxoSendPsbt(selectedUtxos, networkConfig.networkType, sendingOrdinalData, redeemFee);
        // redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
        redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * sendingOrdinalData.feeRate;

        response = getSendBTCUTXOArray(utxos, sendingOrdinalData.btcAmount + redeemFee);

        if (!response.isSuccess) {
            return { isSuccess: false, data: 'No enough balance on admin wallet.' };
        }
        selectedUtxos = response.data;
    }

    let psbt = OrdinalsUtxoSendPsbt(selectedUtxos, networkConfig.networkType, sendingOrdinalData, redeemFee);
    // let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)
    // const tx = signedPsbt.extractTransaction(true);

    return psbt;
}

function tweakSigner(signer: any, opts: any = {}) {
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error('Private key is required for tweaking signer!');
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error('Invalid tweaked private key!');
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return crypto.taggedHash(
        "TapTweak",
        Buffer.concat(h ? [pubKey, h] : [pubKey])
    );
}
