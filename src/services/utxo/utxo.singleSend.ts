import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
} from "../../config/network.config";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import {
  redeemSingleSendUTXOPsbt,
  singleSendUTXOPsbt,
} from "./utxo.singleSendPsbt";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from "../wallet/WIFWallet";
import { getSendBTCUTXOArray } from "./utxo.management";
import { setUtxoFlag, waitUtxoFlag } from "../../utils/mutex";
import { WIF, SEED } from "../../config/network.config";
import { getBtcUtxoInfo } from "../../utils/unisat.api";
import { getUtxos } from "../../utils/mempool";
import { IUtxo } from "../../utils/types";

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

export const singleSendUTXO = async (
  address: string,
  feeRate: number,
  userUtxo: IUtxo,
  amount: number
) => {
  let redeemFee = SEND_UTXO_FEE_LIMIT;

  let redeemPsbt: Bitcoin.Psbt = redeemSingleSendUTXOPsbt(
    wallet,
    userUtxo,
    networkType,
    amount,
    redeemFee
  );
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
  redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;

  let psbt = singleSendUTXOPsbt(
    wallet,
    userUtxo,
    networkType,
    redeemFee,
    address,
    amount
  );
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
  const tx = signedPsbt.extractTransaction(true);

  await setUtxoFlag(0);

  return { isSuccess: true, data: tx };
};
