import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
Bitcoin.initEccLib(ecc);


interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

export const redeemSendUTXOPsbt = (wallet: any, utxo: IUtxo, networkType: string, amount: number): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            value: utxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });

    psbt.addOutput({
        address: wallet.address,
        value: amount,
    });
    
    psbt.addOutput({
        address: wallet.address,
        value: utxo.value - 1000 - amount,
    });

    return psbt;
}

export const sendUTXOPsbt = (wallet: any, utxo: IUtxo, networkType: string, fee: number, address: string, amount: number): Bitcoin.Psbt => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            value: utxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });

    psbt.addOutput({
        address: address,
        value: amount,
    });
    
    psbt.addOutput({
        address: wallet.address,
        value: utxo.value - fee - amount,
    });

    return psbt;
}

