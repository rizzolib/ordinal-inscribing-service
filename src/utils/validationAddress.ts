const bitcoin = require('bitcoinjs-lib');
import networkConfig from "../config/network.config";


const network = networkConfig.networkType == "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

export function isValidBitcoinAddress(address: string): Boolean {
    try {
        bitcoin.address.toOutputScript(address, network);
        return true;
    } catch (e) {
        return false;
    }
}