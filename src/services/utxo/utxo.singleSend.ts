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
import { WIFWallet } from "../wallet/WIFWallet";
import { WIF, SEED } from "../../config/network.config";
import { IUtxo } from "../../utils/types";

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: WIFWallet;

const privateKey: string = process.env.PRIVATE_KEY as string;
wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });

export const singleSendUTXO = async (
  address: string,
  feeRate: number,
  userUtxo: IUtxo,
  amount: number,
  holderStatus: boolean
) => {
  let redeemFee = SEND_UTXO_FEE_LIMIT;

  let redeemPsbt: Bitcoin.Psbt = redeemSingleSendUTXOPsbt(
    wallet,
    userUtxo,
    networkType,
    amount,
    redeemFee,
    holderStatus
  );
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
  redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;

  let psbt = singleSendUTXOPsbt(
    wallet,
    userUtxo,
    networkType,
    redeemFee,
    address,
    amount,
    holderStatus
  );
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
  const tx = signedPsbt.extractTransaction(true);

  return { isSuccess: true, data: tx };
};
