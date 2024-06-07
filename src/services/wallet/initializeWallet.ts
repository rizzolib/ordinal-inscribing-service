import networkConfig from "../../config/network.config";
import { TESTNET, WIF, SEED } from "../../config/network.config";
import * as ecc from "tiny-secp256k1";
import { initEccLib, networks } from "bitcoinjs-lib";
import { WIFWallet } from "./WIFWallet";
import { SeedWallet } from "./SeedWallet";

initEccLib(ecc as any);

const networkType: string = networkConfig.networkType;
let wallet: any;

const network =
  networkConfig.networkType == TESTNET ? networks.testnet : networks.bitcoin;

if (networkConfig.walletType == WIF) {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == SEED) {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

export default wallet;
