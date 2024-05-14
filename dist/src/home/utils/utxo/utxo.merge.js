"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeUTXOPsbt = exports.redeemMergeUTXOPsbt = void 0;
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("tiny-secp256k1"));
Bitcoin.initEccLib(ecc);
const redeemMergeUTXOPsbt = (wallet, utxos, networkType, mergeCount) => {
    let value = 0;
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    for (let i = 0; i < mergeCount; i++) {
        psbt.addInput({
            hash: utxos[i].txid,
            index: utxos[i].vout,
            witnessUtxo: {
                value: utxos[i].value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
        value += utxos[i].value;
    }
    psbt.addOutput({
        address: wallet.address,
        value: value - 1000,
    });
    return psbt;
};
exports.redeemMergeUTXOPsbt = redeemMergeUTXOPsbt;
const mergeUTXOPsbt = (wallet, utxos, networkType, mergeCount, fee) => {
    let value = 0;
    const psbt = new Bitcoin.Psbt({
        network: networkType == "testnet" ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    for (let i = 0; i < mergeCount; i++) {
        psbt.addInput({
            hash: utxos[i].txid,
            index: utxos[i].vout,
            witnessUtxo: {
                value: utxos[i].value,
                script: wallet.output,
            },
            tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
        });
        value += utxos[i].value;
    }
    psbt.addOutput({
        address: wallet.address,
        value: value - fee,
    });
    if (value < fee)
        throw new Error("No enough Fee");
    return psbt;
};
exports.mergeUTXOPsbt = mergeUTXOPsbt;
