import networkConfig, { SEND_UTXO_FEE_LIMIT } from "../../config/network.config";
import { getUtxos, pushBTCpmt } from "../../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { redeemReinscribeAndUtxoSendPsbt, ReinscribeAndUtxoSendPsbt } from "./utxo.reinscribe.singleSendPsbt";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from '../wallet/WIFWallet'
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

export const reinscriptionAndUTXOSend = async (reinscriptionId: string, address: string, feeRate: number, amount: number) => {

  const reinscriptionUTXO: IUtxo = await getInscriptionInfo(reinscriptionId, networkConfig.networkType)

  await waitUtxoFlag();
  await setUtxoFlag(1);

  // const utxos = await getBtcUtxoInfo(wallet.address, networkType)
  let utxos = await getUtxos(wallet.address, networkType)
  utxos = utxos.filter((utxo: IUtxo, index: number) => utxo.value > 5000)

  let response = getSendBTCUTXOArray(utxos, amount + SEND_UTXO_FEE_LIMIT);
  if (!response.isSuccess) {
    return { isSuccess: false, data: 'No enough balance on admin wallet.' };
  }

  let selectedUtxos = response.data;
  let redeemFee = SEND_UTXO_FEE_LIMIT;

  for (let i = 0; i < 3; i++) {
    let redeemPsbt: Bitcoin.Psbt = redeemReinscribeAndUtxoSendPsbt(wallet, selectedUtxos, networkType, amount, reinscriptionUTXO, redeemFee);
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
    redeemFee = redeemPsbt.extractTransaction(true).virtualSize() * feeRate;

    response = getSendBTCUTXOArray(utxos, amount + redeemFee);

    if (!response.isSuccess) {
      return { isSuccess: false, data: 'No enough balance on admin wallet.' };
    }
    selectedUtxos = response.data;
  }

  let psbt = ReinscribeAndUtxoSendPsbt(wallet, selectedUtxos, networkType, redeemFee, address, amount, reinscriptionUTXO);
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)
  const tx = signedPsbt.extractTransaction(true);

  await setUtxoFlag(0);

  return { isSuccess: true, data: tx };
}
