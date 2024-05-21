import dotenv from "dotenv";

export const WIF = 'WIF';
export const SEED = 'SEED';
export const TESTNET = 'testnet';

export const MAXIMUMFEERATE = 100000;
export const SEND_UTXO_FEE_LIMIT = 100000;

dotenv.config();
const networkConfig = {
  walletType: process.env.PRIVATE_KEY ? WIF : SEED,
  networkType: process.env.NETWORKTYPE as string,
};

export default networkConfig;
