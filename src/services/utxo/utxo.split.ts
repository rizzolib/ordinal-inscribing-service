import networkConfig, { SEND_UTXO_FEE_LIMIT } from "../../config/network.config";
import { getUtxos, pushBTCpmt } from "../../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from '../wallet/WIFWallet'
import { setUtxoFlag, waitUtxoFlag } from "../../utils/mutex";
import { WIF, SEED } from "../../config/network.config";
import { getRecommendedFeeRate } from "../../utils/mempool";
import { redeemUtxoSplitPsbt, utxoSplitPsbt } from "./utxo.splitPsbt";

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: SeedWallet | WIFWallet;

if (networkConfig.walletType == WIF) {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == SEED) {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

export const splitUTXO = async () => {
  const recomFeeRate = await getRecommendedFeeRate(networkType);
  const splitFeeRate = recomFeeRate.fastestFee * 1.1;
  await waitUtxoFlag();
  await setUtxoFlag(1);
  const utxos = await getUtxos(wallet.address, networkType);
  const filteredUtxos = utxos.filter((utxo: any) => utxo.value > SEND_UTXO_FEE_LIMIT);
  if (filteredUtxos.length) {

    let redeemPsbt: Bitcoin.Psbt = redeemUtxoSplitPsbt(wallet, filteredUtxos, networkType);
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
    let redeemFee = redeemPsbt.extractTransaction().virtualSize() * splitFeeRate;
    let psbt = utxoSplitPsbt(wallet, filteredUtxos, networkType, redeemFee);
    let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)

    const txHex = signedPsbt.extractTransaction().toHex();

    const txId = await pushBTCpmt(txHex, networkType);

    await setUtxoFlag(0);

    return { isSuccess: true, data: txId };
  } else {
    await setUtxoFlag(0);
    return { isSuccess: false, data: 'Wallet UTXO split is failed!' };
  }
}
