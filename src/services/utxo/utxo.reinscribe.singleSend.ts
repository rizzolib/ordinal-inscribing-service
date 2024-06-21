import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
} from "../../config/network.config";
import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import dotenv from "dotenv";
import {
  redeemReinscribeAndUtxoSendPsbt,
  ReinscribeAndUtxoSendPsbt,
} from "./utxo.reinscribe.singleSendPsbt";
import { WIFWallet } from "../wallet/WIFWallet";
import { getInscriptionInfo } from "../../utils/unisat.api";
import { IUtxo } from "../../utils/types";

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: WIFWallet;

const privateKey: string = process.env.PRIVATE_KEY as string;
wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });

export const reinscriptionAndUTXOSend = async (
  reinscriptionId: string,
  address: string,
  feeRate: number,
  userUtxo: IUtxo,
  amount: number,
  holderStatus: boolean
) => {
  console.log("reinscriptionId => ", reinscriptionId);

  const reinscriptionUTXO: IUtxo = await getInscriptionInfo(
    reinscriptionId,
    networkConfig.networkType
  );

  console.log("reinscriptionUTXO => ", reinscriptionUTXO);

  let redeemFee = SEND_UTXO_FEE_LIMIT;

  let redeemPsbt: Bitcoin.Psbt = redeemReinscribeAndUtxoSendPsbt(
    wallet,
    userUtxo,
    networkType,
    amount,
    reinscriptionUTXO,
    redeemFee,
    holderStatus
  );
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);
  redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;

  let psbt = ReinscribeAndUtxoSendPsbt(
    wallet,
    userUtxo,
    networkType,
    redeemFee,
    address,
    amount,
    reinscriptionUTXO,
    holderStatus
  );
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
  const tx = signedPsbt.extractTransaction(true);

  return { isSuccess: true, data: tx };
};
