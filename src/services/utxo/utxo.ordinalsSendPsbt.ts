import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import networkConfig, { TESTNET } from "../../config/network.config";
import { ISendingOrdinalData } from "../../utils/types";
import { getInscriptionInfo } from "../../utils/unisat.api";
import wallet from "../wallet/initializeWallet";
import { toXOnly } from "../../utils/buffer";

Bitcoin.initEccLib(ecc);

interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

export const RedeemOrdinalsUtxoSendPsbt = async (selectedUtxos: Array<IUtxo>, networkType: string, sendingOrdinalData: ISendingOrdinalData, redeemFee: number): Promise<Bitcoin.Psbt> => {
    
    const psbt = new Bitcoin.Psbt({
        network: networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });

    const network: Bitcoin.Network = networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin;

    let inputUtxoSumValue: number = selectedUtxos.reduce((accumulator: number, currentValue: IUtxo) => accumulator + currentValue.value, 0);

    let parentInscriptionUTXO: IUtxo = await getInscriptionInfo(sendingOrdinalData.parentId, networkConfig.networkType);
    let reInscriptionUTXO: IUtxo = await getInscriptionInfo(sendingOrdinalData.reinscriptionId, networkConfig.networkType);

    if (sendingOrdinalData.parentId) {
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addInput({
            hash: reInscriptionUTXO.txid,
            index: reInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
    }

    selectedUtxos.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        })
    });

    if (sendingOrdinalData.parentId) {
        psbt.addOutput({
            address: wallet.address,
            value: parentInscriptionUTXO.value
        })
    }

    if (sendingOrdinalData.reinscriptionId) {
        psbt.addOutput({
            address: wallet.address,
            value: reInscriptionUTXO.value
        })
    }

    psbt.addOutput({
        address: wallet.address,
        value: sendingOrdinalData.btcAmount
    })

    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
    });

    return psbt;
}


export const OrdinalsUtxoSendPsbt = async (selectedUtxos: Array<IUtxo>, networkType: string, sendingOrdinalData: ISendingOrdinalData, redeemFee: number): Promise<Bitcoin.Psbt> => {
    
    const psbt = new Bitcoin.Psbt({
        network: networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });

    const network: Bitcoin.Network = networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin;

    let inputUtxoSumValue: number = selectedUtxos.reduce((accumulator: number, currentValue: IUtxo) => accumulator + currentValue.value, 0);

    let parentInscriptionUTXO: IUtxo = await getInscriptionInfo(sendingOrdinalData.parentId, networkConfig.networkType);
    let reInscriptionUTXO: IUtxo = await getInscriptionInfo(sendingOrdinalData.reinscriptionId, networkConfig.networkType);

    if (sendingOrdinalData.parentId) {
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress as string, network),
            },
            tapInternalKey: toXOnly(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addInput({
            hash: reInscriptionUTXO.txid,
            index: reInscriptionUTXO.vout,
            witnessUtxo: {
                value: reInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress as string, network),
            },
            tapInternalKey: toXOnly(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        });
    }

    selectedUtxos.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress as string, network),
            },
            tapInternalKey: toXOnly(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        })
    });

    if (sendingOrdinalData.parentId) {
        psbt.addOutput({
            address: wallet.address,
            value: parentInscriptionUTXO.value
        })
    }

    if (sendingOrdinalData.reinscriptionId) {
        psbt.addOutput({
            address: wallet.address,
            value: reInscriptionUTXO.value
        })
    }

    psbt.addOutput({
        address: wallet.address,
        value: sendingOrdinalData.btcAmount
    })
    
    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
    });

    return psbt;
}