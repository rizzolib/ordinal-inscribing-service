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
exports.sendUTXO = void 0;
const network_config_1 = __importDefault(require("../config/network.config"));
const mempool_1 = require("../utils/mempool");
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("tiny-secp256k1"));
const dotenv_1 = __importDefault(require("dotenv"));
const utxo_send_1 = require("../utils/utxo/utxo.send");
const SeedWallet_1 = require("../utils/wallet/SeedWallet");
const WIFWallet_1 = require("../utils/wallet/WIFWallet");
const SEND_UTXO_LIMIT = 1000;
dotenv_1.default.config();
Bitcoin.initEccLib(ecc);
const networkType = network_config_1.default.networkType;
let wallet;
if (network_config_1.default.walletType == 'WIF') {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
}
else if (network_config_1.default.walletType == 'WIF') {
    const seed = process.env.MNEMONIC;
    const wallet = new SeedWallet_1.SeedWallet({ networkType: networkType, seed: seed });
}
const sendUTXO = (address, feeRate, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const utxos = yield (0, mempool_1.getUtxos)(wallet.address, networkType);
    const utxo = utxos.find((utxo) => utxo.value > amount + SEND_UTXO_LIMIT);
    if (utxo === undefined)
        throw new Error("No btcs");
    let redeemPsbt = (0, utxo_send_1.redeemSendUTXOPsbt)(wallet, utxo, networkType, amount);
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
    let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;
    const utxos_real = yield (0, mempool_1.getUtxos)(wallet.address, networkType);
    const utxo_real = utxos_real.find((utxo) => utxo.value > amount + redeemFee);
    if (utxo === undefined)
        throw new Error("No btcs");
    let psbt = (0, utxo_send_1.sendUTXOPsbt)(wallet, utxo_real, networkType, redeemFee, address, amount);
    let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
    const txHex = signedPsbt.extractTransaction().toHex();
    const txId = yield (0, mempool_1.pushBTCpmt)(txHex, networkType);
    return txId;
});
exports.sendUTXO = sendUTXO;
