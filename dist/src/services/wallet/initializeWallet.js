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
const network_config_1 = __importDefault(require("../../config/network.config"));
const network_config_2 = require("../../config/network.config");
const ecc = __importStar(require("tiny-secp256k1"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const WIFWallet_1 = require("./WIFWallet");
const SeedWallet_1 = require("./SeedWallet");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const networkType = network_config_1.default.networkType;
let wallet;
const network = network_config_1.default.networkType == network_config_2.TESTNET ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
if (network_config_1.default.walletType == network_config_2.WIF) {
    const privateKey = process.env.PRIVATE_KEY;
    wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
}
else if (network_config_1.default.walletType == network_config_2.SEED) {
    const seed = process.env.MNEMONIC;
    wallet = new SeedWallet_1.SeedWallet({ networkType: networkType, seed: seed });
}
exports.default = wallet;
