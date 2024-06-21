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
exports.reinscriptionAndUTXOSend = void 0;
const network_config_1 = __importStar(require("../../config/network.config"));
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const dotenv_1 = __importDefault(require("dotenv"));
const utxo_reinscribe_singleSendPsbt_1 = require("./utxo.reinscribe.singleSendPsbt");
const WIFWallet_1 = require("../wallet/WIFWallet");
const unisat_api_1 = require("../../utils/unisat.api");
dotenv_1.default.config();
Bitcoin.initEccLib(secp256k1_1.default);
const networkType = network_config_1.default.networkType;
let wallet;
const privateKey = process.env.PRIVATE_KEY;
wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
const reinscriptionAndUTXOSend = (reinscriptionId, address, feeRate, userUtxo, amount, holderStatus) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reinscriptionId => ", reinscriptionId);
    const reinscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(reinscriptionId, network_config_1.default.networkType);
    console.log("reinscriptionUTXO => ", reinscriptionUTXO);
    let redeemFee = network_config_1.SEND_UTXO_FEE_LIMIT;
    let redeemPsbt = (0, utxo_reinscribe_singleSendPsbt_1.redeemReinscribeAndUtxoSendPsbt)(wallet, userUtxo, networkType, amount, reinscriptionUTXO, redeemFee, holderStatus);
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
    redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;
    let psbt = (0, utxo_reinscribe_singleSendPsbt_1.ReinscribeAndUtxoSendPsbt)(wallet, userUtxo, networkType, redeemFee, address, amount, reinscriptionUTXO, holderStatus);
    let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
    const tx = signedPsbt.extractTransaction(true);
    return { isSuccess: true, data: tx };
});
exports.reinscriptionAndUTXOSend = reinscriptionAndUTXOSend;
