import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
Bitcoin.initEccLib(ecc);

interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

export const redeemMultiSendPsbt = (wallet: any, inputUtxoArray: Array<IUtxo>, networkType: string, outputAmountArray: Array<number>): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue: number = inputUtxoArray.reduce((accumulator:number, currentValue: IUtxo) => accumulator + currentValue.value, 0);
    const outputUtxoSumAmount: number = outputAmountArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);
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

    outputAmountArray.forEach((amount: number, index: number) => {
        psbt.addOutput({
            address: wallet.address,
            value: outputAmountArray[index],
        });
    });

    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue - 1000 - outputUtxoSumAmount,
    });

    return psbt;
}

export const multiSendPsbt = (wallet: any, inputUtxoArray: Array<IUtxo>, networkType: string, fee: number, outputAddressArray: Array<string>, outputAmountArray: Array<number>): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue: number = inputUtxoArray.reduce((accumulator:number, currentValue: IUtxo) => accumulator + currentValue.value, 0);
    const outputUtxoSumAmount: number = outputAmountArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);
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

    outputAddressArray.forEach((address: string, index: number) => {
        psbt.addOutput({
            address: address,
            value: outputAmountArray[index],
        });
    });

    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue - fee - outputUtxoSumAmount,
    });

    return psbt;
}