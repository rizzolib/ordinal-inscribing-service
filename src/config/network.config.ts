import dotenv from "dotenv";

dotenv.config();

export const WIF = "WIF";
export const SEED = "SEED";
export const TESTNET = "testnet";
export const MAINNET = "mainnet";

export const MAXIMUMFEERATE = 100000;
export const SEND_UTXO_FEE_LIMIT = 100000;

export const DELEGATE_CONTENT = "Delegate";
export const FILE_CONTENT = "File";
export const TEXT_CONTENT = "Text";

const networkConfig = {
  walletType: process.env.PRIVATE_KEY ? WIF : SEED,
  networkType: process.env.NETWORKTYPE as string,
};

export default networkConfig;
