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
const network_config_1 = __importStar(require("../../config/network.config"));
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = require("ecpair");
const utxo_management_1 = require("../../services/utxo/utxo.management");
const utxo_ordinalsSendPsbt_1 = require("../../services/utxo/utxo.ordinalsSendPsbt");
const unisat_api_1 = require("../../utils/unisat.api");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const ECPair = (0, ecpair_1.ECPairFactory)(ecc);
const sendOrdinalBTCPsbt = (sendingOrdinalData) => __awaiter(void 0, void 0, void 0, function* () {
    const utxos = yield (0, unisat_api_1.getBtcUtxoInfo)(sendingOrdinalData.paymentAddress, network_config_1.default.networkType);
    let response = (0, utxo_management_1.getSendBTCUTXOArray)(utxos, sendingOrdinalData.btcAmount + network_config_1.SEND_UTXO_FEE_LIMIT);
    if (!response.isSuccess) {
        return { isSuccess: false, data: "No enough balance on your wallet." };
    }
    let selectedUtxos = response.data;
    let redeemFee = network_config_1.SEND_UTXO_FEE_LIMIT;
    for (let i = 0; i < 3; i++) {
        let redeemPsbt = yield (0, utxo_ordinalsSendPsbt_1.RedeemOrdinalsUtxoSendPsbt)(selectedUtxos, network_config_1.default.networkType, sendingOrdinalData, redeemFee);
        redeemPsbt = initializeWallet_1.default.signPsbt(redeemPsbt, initializeWallet_1.default.ecPair);
        redeemFee =
            redeemPsbt.extractTransaction(true).virtualSize() *
                sendingOrdinalData.feeRate;
        response = (0, utxo_management_1.getSendBTCUTXOArray)(utxos, sendingOrdinalData.btcAmount + redeemFee);
        if (!response.isSuccess) {
            return { isSuccess: false, data: "No enough balance on your wallet." };
        }
        selectedUtxos = response.data;
    }
    let psbt = yield (0, utxo_ordinalsSendPsbt_1.OrdinalsUtxoSendPsbt)(selectedUtxos, network_config_1.default.networkType, sendingOrdinalData, redeemFee);
    return { isSuccess: true, data: psbt };
});
exports.sendOrdinalBTCPsbt = sendOrdinalBTCPsbt;
