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
exports.splitUTXO = void 0;
const network_config_1 = __importStar(require("../../config/network.config"));
const mempool_1 = require("../../utils/mempool");
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const ecc = __importStar(require("tiny-secp256k1"));
const dotenv_1 = __importDefault(require("dotenv"));
const SeedWallet_1 = require("../wallet/SeedWallet");
const WIFWallet_1 = require("../wallet/WIFWallet");
const mutex_1 = require("../../utils/mutex");
const network_config_2 = require("../../config/network.config");
const mempool_2 = require("../../utils/mempool");
const utxo_splitPsbt_1 = require("./utxo.splitPsbt");
dotenv_1.default.config();
Bitcoin.initEccLib(ecc);
const networkType = network_config_1.default.networkType;
let wallet;
if (network_config_1.default.walletType == network_config_2.WIF) {
    const privateKey = process.env.PRIVATE_KEY;
    wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
}
else if (network_config_1.default.walletType == network_config_2.SEED) {
    const seed = process.env.MNEMONIC;
    wallet = new SeedWallet_1.SeedWallet({ networkType: networkType, seed: seed });
}
const splitUTXO = () => __awaiter(void 0, void 0, void 0, function* () {
    const recomFeeRate = yield (0, mempool_2.getRecommendedFeeRate)(networkType);
    const splitFeeRate = recomFeeRate.fastestFee * 1.1;
    yield (0, mutex_1.waitUtxoFlag)();
    yield (0, mutex_1.setUtxoFlag)(1);
    // const utxos = await getBtcUtxoInfo(wallet.address, networkType)
    let utxos = yield (0, mempool_1.getUtxos)(wallet.address, networkType);
    utxos = utxos.filter((utxo, index) => utxo.value > 5000);
    const filteredUtxos = utxos.filter((utxo) => utxo.value > network_config_1.SEND_UTXO_FEE_LIMIT);
    if (filteredUtxos.length) {
        let redeemPsbt = (0, utxo_splitPsbt_1.redeemUtxoSplitPsbt)(wallet, filteredUtxos, networkType);
        redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
        let redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * splitFeeRate;
        let psbt = (0, utxo_splitPsbt_1.utxoSplitPsbt)(wallet, filteredUtxos, networkType, redeemFee);
        let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
        const txHex = signedPsbt.extractTransaction(true).toHex();
        const txId = yield (0, mempool_1.pushBTCpmt)(txHex, networkType);
        yield (0, mutex_1.setUtxoFlag)(0);
        return { isSuccess: true, data: txId };
    }
    else {
        yield (0, mutex_1.setUtxoFlag)(0);
        return { isSuccess: false, data: 'Wallet UTXO split is failed!' };
    }
});
exports.splitUTXO = splitUTXO;
