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
exports.sendOrdinalBTCPsbt = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const buffer_1 = require("../../utils/buffer");
const network_config_1 = __importStar(require("../../config/network.config"));
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = require("ecpair");
const mempool_1 = require("../../utils/mempool");
const utxo_management_1 = require("../../services/utxo/utxo.management");
const utxo_ordinalsSendPsbt_1 = require("../../services/utxo/utxo.ordinalsSendPsbt");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const ECPair = (0, ecpair_1.ECPairFactory)(ecc);
const sendOrdinalBTCPsbt = (sendingOrdinalData) => __awaiter(void 0, void 0, void 0, function* () {
    const network = network_config_1.default.networkType == network_config_1.TESTNET ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
    const keyPair = initializeWallet_1.default.ecPair;
    // const utxos = await getBtcUtxoInfo(wallet.address, networkType)
    let utxos = yield (0, mempool_1.getUtxos)(sendingOrdinalData.receiveAddress, network_config_1.default.networkType);
    utxos = utxos.filter((utxo, index) => utxo.value > 5000);
    let response = (0, utxo_management_1.getSendBTCUTXOArray)(utxos, sendingOrdinalData.btcAmount + network_config_1.SEND_UTXO_FEE_LIMIT);
    if (!response.isSuccess) {
        return { isSuccess: false, data: 'No enough balance on admin wallet.' };
    }
    let selectedUtxos = response.data;
    let redeemFee = network_config_1.SEND_UTXO_FEE_LIMIT;
    for (let i = 0; i < 3; i++) {
        let redeemPsbt = yield (0, utxo_ordinalsSendPsbt_1.OrdinalsUtxoSendPsbt)(selectedUtxos, network_config_1.default.networkType, sendingOrdinalData, redeemFee);
        // redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
        redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * sendingOrdinalData.feeRate;
        response = (0, utxo_management_1.getSendBTCUTXOArray)(utxos, sendingOrdinalData.btcAmount + redeemFee);
        if (!response.isSuccess) {
            return { isSuccess: false, data: 'No enough balance on admin wallet.' };
        }
        selectedUtxos = response.data;
    }
    let psbt = (0, utxo_ordinalsSendPsbt_1.OrdinalsUtxoSendPsbt)(selectedUtxos, network_config_1.default.networkType, sendingOrdinalData, redeemFee);
    // let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)
    // const tx = signedPsbt.extractTransaction(true);
    return psbt;
});
exports.sendOrdinalBTCPsbt = sendOrdinalBTCPsbt;
function tweakSigner(signer, opts = {}) {
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error('Private key is required for tweaking signer!');
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash((0, buffer_1.toXOnly)(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error('Invalid tweaked private key!');
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
function tapTweakHash(pubKey, h) {
    return bitcoinjs_lib_1.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
