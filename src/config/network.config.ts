import dotenv from "dotenv";

dotenv.config();
const networkConfig = {
  walletType: process.env.PRIVATE_KEY ? 'WIF' : 'SEED',
  networkType: process.env.NETWORKTYPE as string,
};

export default networkConfig;
