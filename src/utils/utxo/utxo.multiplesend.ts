import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
Bitcoin.initEccLib(ecc);


interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

export const redeemMultipleSendUTXOPsbt = (wallet: any, utxo: IUtxo, networkType: string, amountArray: Array<number>): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    const UTXOSumAmount = amountArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            value: utxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
    amountArray.forEach((amount: number) => {
        psbt.addOutput({
            address: wallet.address,
            value: amount,
        });

    });
    psbt.addOutput({
        address: wallet.address,
        value: utxo.value - 1000 - UTXOSumAmount,
    });

    return psbt;
}

export const multipleSendUTXOPsbt = (wallet: any, utxo: IUtxo, networkType: string, fee: number, addressArray: Array<string>, amountArray: Array<number>): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    const UTXOSumAmount = amountArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            value: utxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });

    addressArray.forEach((address: string, index: number) => {
        psbt.addOutput({
            address: address,
            value: amountArray[index],
        });
    });

    psbt.addOutput({
        address: wallet.address,
        value: utxo.value - fee - UTXOSumAmount,
    });

    return psbt;
}

