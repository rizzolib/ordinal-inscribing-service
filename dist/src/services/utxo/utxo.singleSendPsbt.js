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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleSendUTXOPsbt = exports.redeemSingleSendUTXOPsbt = void 0;
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const network_config_1 = require("../../config/network.config");
Bitcoin.initEccLib(secp256k1_1.default);
const redeemSingleSendUTXOPsbt = (wallet, userUtxo, networkType, amount, fee, holderStatus) => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET
            ? Bitcoin.networks.testnet
            : Bitcoin.networks.bitcoin,
    });
    psbt.addInput({
        hash: userUtxo.txid,
        index: userUtxo.vout,
        witnessUtxo: {
            value: userUtxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
    psbt.addOutput({
        address: wallet.address,
        value: amount,
    });
    if (!holderStatus) {
        psbt.addOutput({
            address: wallet.address,
            value: userUtxo.value - fee - amount,
        });
    }
    return psbt;
};
exports.redeemSingleSendUTXOPsbt = redeemSingleSendUTXOPsbt;
const singleSendUTXOPsbt = (wallet, userUtxo, networkType, fee, address, amount, holderStatus) => {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET
            ? Bitcoin.networks.testnet
            : Bitcoin.networks.bitcoin,
    });
    psbt.addInput({
        hash: userUtxo.txid,
        index: userUtxo.vout,
        witnessUtxo: {
            value: userUtxo.value,
            script: wallet.output,
        },
        tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
    psbt.addOutput({
        address: address,
        value: amount,
    });
    if (!holderStatus) {
        psbt.addOutput({
            address: wallet.address,
            value: userUtxo.value - fee - amount,
        });
    }
    return psbt;
};
exports.singleSendUTXOPsbt = singleSendUTXOPsbt;
