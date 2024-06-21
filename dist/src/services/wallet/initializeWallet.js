"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const network_config_1 = __importDefault(require("../../config/network.config"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const WIFWallet_1 = require("./WIFWallet");
(0, bitcoinjs_lib_1.initEccLib)(secp256k1_1.default);
const networkType = network_config_1.default.networkType;
let wallet;
const privateKey = process.env.PRIVATE_KEY;
wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
exports.default = wallet;
