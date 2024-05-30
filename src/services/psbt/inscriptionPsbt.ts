import {
    Psbt,
    networks,
    payments,
    script,
    initEccLib,
    crypto,
} from "bitcoinjs-lib";
import { IUtxo } from "../../utils/types";
import { Taptree } from "bitcoinjs-lib/src/types";
import { toXOnly } from "../../utils/buffer";
import networkConfig, { DELEGATE_CONTENT, FILE_CONTENT, TESTNET, TEXT_CONTENT } from "../../config/network.config";
import wallet from "../wallet/initializeWallet";
import { getInscriptionInfo } from "../../utils/unisat.api";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory, ECPairAPI } from "ecpair";

initEccLib(ecc as any);
const ECPair: ECPairAPI = ECPairFactory(ecc);

export const inscriptionPsbt = async (contentType: string, inscriptionData: any, tapScript: Array<any>, sentUtxo: any): Promise<any> => {

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

    const psbt = new Psbt({ network });
    if (inscriptionData.parentId) {
        let parentInscriptionUTXO: IUtxo = await getInscriptionInfo(inscriptionData.parentId, networkConfig.networkType);

        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: wallet.output,
            },
            tapInternalKey: toXOnly(keyPair.publicKey),
        });
    }

    psbt.addInput({
        hash: sentUtxo.txid,
        index: sentUtxo.vout,
        tapInternalKey: toXOnly(keyPair.publicKey),
        witnessUtxo: { value: sentUtxo.value, script: ordinal_p2tr.output! },
        tapLeafScript: [
            {
                leafVersion: redeem.redeemVersion,
                script: redeem.output,
                controlBlock: ordinal_p2tr.witness![ordinal_p2tr.witness!.length - 1],
            },
        ],
    });
    if (inscriptionData.parentId) {
        psbt.addOutput({
            address: inscriptionData.receiveAddress,
            value: inscriptionData.padding
        })
    }
    if (contentType == TEXT_CONTENT) {
        inscriptionData.contents.forEach((content: string) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding
            })
        });
    } else if (contentType == FILE_CONTENT) {
        inscriptionData.files.forEach((content: string) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding
            })
        })
    } else if (contentType == DELEGATE_CONTENT) {
        inscriptionData.delegateIds.forEach((content: string) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding
            })
        })
    }
    //Sign psbt
    if (inscriptionData.parentId) {
        const signer = tweakSigner(keyPair, { network })
        psbt.signInput(0, signer);
        psbt.signInput(1, keyPair);
    } else {
        psbt.signInput(0, keyPair);
    }
    
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction(true);

    return tx;
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
