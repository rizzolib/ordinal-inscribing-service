import networkConfig from "../../config/network.config";
import * as ecc from "tiny-secp256k1";
import { initEccLib } from "bitcoinjs-lib";
import { WIFWallet } from "./WIFWallet";
initEccLib(ecc as any);

const networkType: string = networkConfig.networkType;
let wallet: any;

const privateKey: string = process.env.PRIVATE_KEY as string;
wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
export default wallet;
