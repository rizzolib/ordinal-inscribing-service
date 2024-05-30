"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEXT_CONTENT = exports.FILE_CONTENT = exports.DELEGATE_CONTENT = exports.SEND_UTXO_FEE_LIMIT = exports.MAXIMUMFEERATE = exports.TESTNET = exports.SEED = exports.WIF = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.WIF = 'WIF';
exports.SEED = 'SEED';
exports.TESTNET = 'testnet';
exports.MAXIMUMFEERATE = 100000;
exports.SEND_UTXO_FEE_LIMIT = 100000;
exports.DELEGATE_CONTENT = 'Delegate';
exports.FILE_CONTENT = 'File';
exports.TEXT_CONTENT = 'Text';
const networkConfig = {
    walletType: process.env.PRIVATE_KEY ? exports.WIF : exports.SEED,
    networkType: process.env.NETWORKTYPE,
};
exports.default = networkConfig;
