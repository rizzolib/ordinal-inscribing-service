import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { TESTNET } from "../../config/network.config";
import { SEND_UTXO_FEE_LIMIT } from "../../config/network.config";

Bitcoin.initEccLib(ecc);

interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}


export const redeemUtxoSplitPsbt = (wallet: any, inputUtxoArray: Array<IUtxo>, networkType: string): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue: number = inputUtxoArray.reduce((accumulator: number, currentValue: IUtxo) => accumulator + currentValue.value, 0);
    let outputSize = Math.floor(inputUtxoSumValue / SEND_UTXO_FEE_LIMIT) - 1;
    inputUtxoArray.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
    });
    for (let i = 0; i < outputSize; i++) {
        psbt.addOutput({
            address: wallet.address,
            value: SEND_UTXO_FEE_LIMIT,
        });
    }
    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue - (outputSize + 1) * SEND_UTXO_FEE_LIMIT,
    });

    return psbt;
}

export const utxoSplitPsbt = (wallet: any, inputUtxoArray: Array<IUtxo>, networkType: string, redeemFee: number): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue: number = inputUtxoArray.reduce((accumulator: number, currentValue: IUtxo) => accumulator + currentValue.value, 0);
    let outputSize = Math.floor((inputUtxoSumValue - redeemFee) / SEND_UTXO_FEE_LIMIT);
    inputUtxoArray.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
    });
    for (let i = 0; i < outputSize; i++) {
        psbt.addOutput({
            address: wallet.address,
            value: SEND_UTXO_FEE_LIMIT,
        });
    }
    psbt.addOutput({
        address: wallet.address,
        value: Math.floor(inputUtxoSumValue - redeemFee - outputSize * SEND_UTXO_FEE_LIMIT),
    });

    return psbt;
}