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
exports.tapleafPsbt = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const buffer_1 = require("../../utils/buffer");
const network_config_1 = __importStar(require("../../config/network.config"));
const ecc = __importStar(require("tiny-secp256k1"));
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const utxo_reinscribe_singleSend_1 = require("../utxo/utxo.reinscribe.singleSend");
const utxo_singleSend_1 = require("../utxo/utxo.singleSend");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const network = network_config_1.default.networkType == network_config_1.TESTNET ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
const keyPair = initializeWallet_1.default.ecPair;
const tapleafPsbt = (contentType, inscriptionData, tapScript, userUtxo, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ordinal_script = bitcoinjs_lib_1.script.compile(tapScript);
    const scriptTree = {
        output: ordinal_script,
    };
    const redeem = {
        output: ordinal_script,
        redeemVersion: 192,
    };
    const ordinal_p2tr = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: (0, buffer_1.toXOnly)(keyPair.publicKey),
        network,
        scriptTree,
        redeem,
    });
    const address = (_a = ordinal_p2tr.address) !== null && _a !== void 0 ? _a : "";
    let res = {};
    let inscriptionAmount = 0;
    if (contentType == network_config_1.TEXT_CONTENT)
        inscriptionAmount = inscriptionData.contents.length;
    if (contentType == network_config_1.FILE_CONTENT)
        inscriptionAmount = inscriptionData.files.length;
    if (contentType == network_config_1.DELEGATE_CONTENT)
        inscriptionAmount = inscriptionData.delegateIds.length;
    if (inscriptionData.reinscriptionId && inscriptionAmount == 1) {
        res = yield (0, utxo_reinscribe_singleSend_1.reinscriptionAndUTXOSend)(inscriptionData.reinscriptionId, address, inscriptionData.feeRate, userUtxo, amount, inscriptionData.holderStatus);
    }
    else {
        res = yield (0, utxo_singleSend_1.singleSendUTXO)(address, inscriptionData.feeRate, userUtxo, amount, inscriptionData.holderStatus);
    }
    if (!res.isSuccess) {
        console.log(res.data);
    }
    return res.data;
});
exports.tapleafPsbt = tapleafPsbt;
exports.default = exports.tapleafPsbt;
