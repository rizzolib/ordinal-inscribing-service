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
exports.ReinscribeAndUtxoSendPsbt = exports.redeemReinscribeAndUtxoSendPsbt = void 0;
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("tiny-secp256k1"));
const network_config_1 = require("../../config/network.config");
const network_config_2 = require("../../config/network.config");
Bitcoin.initEccLib(ecc);
const redeemReinscribeAndUtxoSendPsbt = (wallet, inputUtxoArray, networkType, amount, reinscriptionUTXO) => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue = inputUtxoArray.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    psbt.addInput({
        hash: reinscriptionUTXO.txid,
        index: reinscriptionUTXO.vout,
        witnessUtxo: {
            value: reinscriptionUTXO.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
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
    psbt.addOutput({
        address: wallet.address,
        value: amount,
    });
    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue + reinscriptionUTXO.value - network_config_2.SEND_UTXO_FEE_LIMIT - amount,
    });
    return psbt;
};
exports.redeemReinscribeAndUtxoSendPsbt = redeemReinscribeAndUtxoSendPsbt;
const ReinscribeAndUtxoSendPsbt = (wallet, inputUtxoArray, networkType, fee, address, amount, reinscriptionUTXO) => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    let inputUtxoSumValue = inputUtxoArray.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    psbt.addInput({
        hash: reinscriptionUTXO.txid,
        index: reinscriptionUTXO.vout,
        witnessUtxo: {
            value: reinscriptionUTXO.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
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
    psbt.addOutput({
        address: address,
        value: amount,
    });
    psbt.addOutput({
        address: wallet.address,
        value: inputUtxoSumValue + reinscriptionUTXO.value - fee - amount,
    });
    return psbt;
};
exports.ReinscribeAndUtxoSendPsbt = ReinscribeAndUtxoSendPsbt;
