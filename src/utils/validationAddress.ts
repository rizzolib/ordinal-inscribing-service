const bitcoin = require("bitcoinjs-lib");
import networkConfig from "../config/network.config";
import { TESTNET } from "../config/network.config";

const network =
  networkConfig.networkType == TESTNET
    ? bitcoin.networks.testnet
    : bitcoin.networks.bitcoin;

export function isValidBitcoinAddress(address: string): Boolean {
  try {
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch (e) {
    return false;
  }
}
