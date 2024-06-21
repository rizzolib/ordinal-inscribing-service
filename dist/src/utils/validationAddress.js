"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidBitcoinAddress = void 0;
const bitcoin = require("bitcoinjs-lib");
const network_config_1 = __importDefault(require("../config/network.config"));
const network_config_2 = require("../config/network.config");
const network = network_config_1.default.networkType == network_config_2.TESTNET
    ? bitcoin.networks.testnet
    : bitcoin.networks.bitcoin;
function isValidBitcoinAddress(address) {
    try {
        bitcoin.address.toOutputScript(address, network);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isValidBitcoinAddress = isValidBitcoinAddress;
