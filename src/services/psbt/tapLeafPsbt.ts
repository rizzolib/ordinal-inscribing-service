import {
    Transaction,
    script,
    payments,
    initEccLib,
    networks,
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import { toXOnly } from "../../utils/buffer";
import networkConfig, { TESTNET } from "../../config/network.config";
import * as ecc from "tiny-secp256k1";
import wallet from "../wallet/initializeWallet";
import { reinscriptionAndUTXOSend } from "../utxo/utxo.reinscribe.singleSend";
import { singleSendUTXO } from "../utxo/utxo.singleSend";

initEccLib(ecc as any);

export const tapleafPsbt = async (inscriptionData: any, tapScript: Array<any>, sendUTXOSize: number): Promise<Transaction> => {

    const network = networkConfig.networkType == TESTNET ? networks.testnet : networks.bitcoin;
    const keyPair = wallet.ecPair;

    const ordinal_script = script.compile(tapScript);

    const scriptTree: Taptree = {
        output: ordinal_script,
    };

    const redeem = {
        output: ordinal_script,
        redeemVersion: 192,
    };

    const ordinal_p2tr = payments.p2tr({
        internalPubkey: toXOnly(keyPair.publicKey),
        network,
        scriptTree,
        redeem,
    });
    const address: string = ordinal_p2tr.address ?? "";

    let res: any = {};
    if (inscriptionData.reinscriptionId) {
        res = await reinscriptionAndUTXOSend(inscriptionData.reinscriptionId, address, inscriptionData.feeRate, sendUTXOSize)
    } else {
        res = await singleSendUTXO(address, inscriptionData.feeRate, sendUTXOSize);
    }
    
    if (!res.isSuccess) {
        console.log(res.data)
    }

    return res.data;
}