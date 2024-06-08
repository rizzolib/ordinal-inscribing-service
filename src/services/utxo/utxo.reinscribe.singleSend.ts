import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
} from "../../config/network.config";
import { getUtxos, pushBTCpmt } from "../../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import {
  redeemReinscribeAndUtxoSendPsbt,
  ReinscribeAndUtxoSendPsbt,
} from "./utxo.reinscribe.singleSendPsbt";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from "../wallet/WIFWallet";
import { getSendBTCUTXOArray } from "./utxo.management";
import { setUtxoFlag, waitUtxoFlag } from "../../utils/mutex";
import { WIF, SEED } from "../../config/network.config";
import { getBtcUtxoInfo, getInscriptionInfo } from "../../utils/unisat.api";
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

export const reinscriptionAndUTXOSend = async (
  reinscriptionId: string,
  address: string,
  feeRate: number,
  userUtxo: IUtxo,
  amount: number
) => {
  const reinscriptionUTXO: IUtxo = await getInscriptionInfo(
    reinscriptionId,
    networkConfig.networkType
  );

  let redeemFee = SEND_UTXO_FEE_LIMIT;

  let redeemPsbt: Bitcoin.Psbt = redeemReinscribeAndUtxoSendPsbt(
    wallet,
    userUtxo,
    networkType,
    amount,
    reinscriptionUTXO,
    redeemFee
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
    reinscriptionUTXO
  );
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair);
  const tx = signedPsbt.extractTransaction(true);

  return { isSuccess: true, data: tx };
};
