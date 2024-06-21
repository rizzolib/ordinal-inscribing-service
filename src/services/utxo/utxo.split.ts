import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
} from "../../config/network.config";
import { pushBTCpmt } from "../../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import dotenv from "dotenv";
import { WIFWallet } from "../wallet/WIFWallet";
import { getRecommendedFeeRate } from "../../utils/mempool";
import { redeemUtxoSplitPsbt, utxoSplitPsbt } from "./utxo.splitPsbt";
import { getBtcUtxoInfo } from "../../utils/unisat.api";

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: WIFWallet;

const privateKey: string = process.env.PRIVATE_KEY as string;
wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });

export const splitUTXO = async () => {
  const recomFeeRate = await getRecommendedFeeRate(networkType);
  const splitFeeRate = recomFeeRate.fastestFee * 1.1;

  const utxos = await getBtcUtxoInfo(wallet.address, networkType);
  // let utxos = await getUtxos(wallet.address, networkType)
  // utxos = utxos.filter((utxo: IUtxo, index: number) => utxo.value > 5000)

  const filteredUtxos = utxos.filter(
    (utxo: any) => utxo.value > SEND_UTXO_FEE_LIMIT
  );
  if (filteredUtxos.length) {
    let redeemPsbt: Bitcoin.Psbt = redeemUtxoSplitPsbt(
      wallet,
      filteredUtxos,
      networkType
    );
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
    let redeemFee =
      redeemPsbt.extractTransaction(true).virtualSize() * splitFeeRate;
    let psbt = utxoSplitPsbt(wallet, filteredUtxos, networkType, redeemFee);
    let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);

    const txHex = signedPsbt.extractTransaction(true).toHex();

    const txId = await pushBTCpmt(txHex, networkType);

    return { isSuccess: true, data: txId };
  } else {
    return { isSuccess: false, data: "Wallet UTXO split is failed!" };
  }
};
