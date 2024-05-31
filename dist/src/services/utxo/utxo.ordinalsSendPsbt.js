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
exports.OrdinalsUtxoSendPsbt = void 0;
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("tiny-secp256k1"));
const network_config_1 = __importStar(require("../../config/network.config"));
const unisat_api_1 = require("../../utils/unisat.api");
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const buffer_1 = require("../../utils/buffer");
Bitcoin.initEccLib(ecc);
const OrdinalsUtxoSendPsbt = (selectedUtxos, networkType, sendingOrdinalData, redeemFee) => __awaiter(void 0, void 0, void 0, function* () {
    const psbt = new Bitcoin.Psbt({
        network: networkType == network_config_1.TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    });
    const network = networkType == network_config_1.TESTNET ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin;
    let inputUtxoSumValue = selectedUtxos.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    let parentInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.parentId, network_config_1.default.networkType);
    let reInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(sendingOrdinalData.reinscriptionId, network_config_1.default.networkType);
    if (sendingOrdinalData.parentId) {
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress, network),
            },
            tapInternalKey: (0, buffer_1.toXOnly)(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addInput({
            hash: reInscriptionUTXO.txid,
            index: reInscriptionUTXO.vout,
            witnessUtxo: {
                value: reInscriptionUTXO.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress, network),
            },
            tapInternalKey: (0, buffer_1.toXOnly)(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        });
    }
    selectedUtxos.forEach(utxo => {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: Bitcoin.address.toOutputScript(sendingOrdinalData.receiveAddress, network),
            },
            tapInternalKey: (0, buffer_1.toXOnly)(Buffer.from(sendingOrdinalData.publicKey, 'hex')),
        });
    });
    if (sendingOrdinalData.parentId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: parentInscriptionUTXO.value
        });
    }
    if (sendingOrdinalData.reinscriptionId) {
        psbt.addOutput({
            address: initializeWallet_1.default.address,
            value: reInscriptionUTXO.value
        });
    }
    psbt.addOutput({
        address: initializeWallet_1.default.address,
        value: sendingOrdinalData.btcAmount
    });
    psbt.addOutput({
        address: initializeWallet_1.default.address,
        value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
    });
    return psbt;
});
exports.OrdinalsUtxoSendPsbt = OrdinalsUtxoSendPsbt;
