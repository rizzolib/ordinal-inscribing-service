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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdinalsUtxoSendPsbt = exports.RedeemOrdinalsUtxoSendPsbt = void 0;
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const network_config_1 = __importStar(require("../../config/network.config"));
const unisat_api_1 = require("../../utils/unisat.api");
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const mempool_1 = require("../../utils/mempool");
Bitcoin.initEccLib(secp256k1_1.default);
const RedeemOrdinalsUtxoSendPsbt = (selectedUtxos, networkType, sendingOrdinalData, redeemFee) => __awaiter(void 0, void 0, void 0, function* () {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET
            ? Bitcoin.networks.testnet
            : Bitcoin.networks.bitcoin,
    });
    const network = networkType == network_config_1.TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin;
    let inputUtxoSumValue = selectedUtxos.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    let parentInscriptionUTXO = {
        value: 0,
        txid: "",
        vout: 0,
    };
    let reinscriptionUTXO = {
        value: 0,
        txid: "",
        vout: 0,
    };
    if (sendingOrdinalData.parentId) {
        parentInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.parentId, network_config_1.default.networkType);
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: initializeWallet_1.default.output,
            },
            tapInternalKey: Buffer.from(initializeWallet_1.default.publicKey, "hex").subarray(1, 33),
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        reinscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.reinscriptionId, network_config_1.default.networkType);
        psbt.addInput({
            hash: reinscriptionUTXO.txid,
            index: reinscriptionUTXO.vout,
            witnessUtxo: {
                value: reinscriptionUTXO.value,
                script: initializeWallet_1.default.output,
            },
            tapInternalKey: Buffer.from(initializeWallet_1.default.publicKey, "hex").subarray(1, 33),
        });
    }
    selectedUtxos.forEach((utxo) => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: initializeWallet_1.default.output,
            },
            tapInternalKey: Buffer.from(initializeWallet_1.default.publicKey, "hex").subarray(1, 33),
        });
    });
    if (sendingOrdinalData.parentId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: parentInscriptionUTXO.value,
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: reinscriptionUTXO.value,
        });
    }
    psbt.addOutput({
        address: initializeWallet_1.default.address,
        value: sendingOrdinalData.btcAmount,
    });
    psbt.addOutput({
        address: initializeWallet_1.default.address,
        value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
    });
    return psbt;
});
exports.RedeemOrdinalsUtxoSendPsbt = RedeemOrdinalsUtxoSendPsbt;
const OrdinalsUtxoSendPsbt = (selectedUtxos, networkType, sendingOrdinalData, redeemFee) => __awaiter(void 0, void 0, void 0, function* () {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET
            ? Bitcoin.networks.testnet
            : Bitcoin.networks.bitcoin,
    });
    const network = networkType == network_config_1.TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin;
    let inputUtxoSumValue = selectedUtxos.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    let parentInscriptionUTXO = {
        txid: "",
        vout: 0,
        value: 0,
    };
    let reInscriptionUTXO = {
        txid: "",
        vout: 0,
        value: 0,
    };
    if (sendingOrdinalData.parentId) {
        parentInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.parentId, network_config_1.default.networkType);
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.ordinalsAddress, network),
            },
            tapInternalKey: Buffer.from(sendingOrdinalData.ordinalsPublicKey, "hex"),
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        reInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.reinscriptionId, network_config_1.default.networkType);
        psbt.addInput({
            hash: reInscriptionUTXO.txid,
            index: reInscriptionUTXO.vout,
            witnessUtxo: {
                value: reInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.ordinalsAddress, network),
            },
            tapInternalKey: Buffer.from(sendingOrdinalData.ordinalsPublicKey, "hex"),
        });
    }
    if (sendingOrdinalData.ordinalsAddress == sendingOrdinalData.paymentAddress) {
        selectedUtxos.forEach((utxo) => {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    value: utxo.value,
                    script: Bitcoin.address.toOutputScript(sendingOrdinalData.paymentAddress, network),
                },
                tapInternalKey: Buffer.from(sendingOrdinalData.paymentPublicKey, "hex"),
            });
        });
    }
    else {
        // Create a Pay-to-Public-Key-Hash (P2PKH) script
        const p2pkhScript = Bitcoin.script.compile([
            Bitcoin.opcodes.OP_0, // OP_0 indicates a P2PKH script
            Bitcoin.crypto.hash160(Buffer.from(sendingOrdinalData.paymentPublicKey, "hex")), // Hash160 of the public key
        ]);
        for (let i = 0; i < selectedUtxos.length; i++) {
            const txHex = yield (0, mempool_1.getTxHex)(selectedUtxos[i].txid, networkType);
            psbt.addInput({
                hash: selectedUtxos[i].txid,
                index: selectedUtxos[i].vout,
                nonWitnessUtxo: Buffer.from(txHex, "hex"),
                redeemScript: p2pkhScript,
            });
        }
    }
    if (sendingOrdinalData.parentId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: parentInscriptionUTXO.value,
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: reInscriptionUTXO.value,
        });
    }
    psbt.addOutput({
        address: initializeWallet_1.default.address,
        value: sendingOrdinalData.btcAmount,
    });
    psbt.addOutput({
        address: sendingOrdinalData.paymentAddress,
        value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
    });
    return psbt;
});
exports.OrdinalsUtxoSendPsbt = OrdinalsUtxoSendPsbt;
