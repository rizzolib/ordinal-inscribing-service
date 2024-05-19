import networkConfig from "../../config/network.config";
import { getUtxos, pushBTCpmt } from "../mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { redeemSingleSendUTXOPsbt, singleSendUTXOPsbt } from "./utxo.singleSendPsbt";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from '../wallet/WIFWallet'
import { getSendBTCUTXOArray } from "./utxo.management";

const SEND_UTXO_LIMIT = 1000;

dotenv.config();
Bitcoin.initEccLib(ecc);

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

const networkType: string = networkConfig.networkType;
let wallet: SeedWallet | WIFWallet;

if (networkConfig.walletType == 'WIF') {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == 'SEED') {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

export const singleSendUTXO = async (address: string, feeRate: number, amount: number) => {
  const utxos = await getUtxos(wallet.address, networkType);
  let response = getSendBTCUTXOArray(utxos, amount + SEND_UTXO_LIMIT);
  if (!response.isSuccess) {
    return { isSuccess: false, data: 'No enough balance on admin wallet.' };
  }
  let redeemPsbt: Bitcoin.Psbt = redeemSingleSendUTXOPsbt(wallet, response.data, networkType, amount);
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
  let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

  response = getSendBTCUTXOArray(utxos, amount + redeemFee);

  if (!response.isSuccess) {
    return { isSuccess: false, data: 'No enough balance on admin wallet.' };
  }

  let psbt = singleSendUTXOPsbt(wallet, response.data, networkType, redeemFee, address, amount);
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)

  const txHex = signedPsbt.extractTransaction().toHex();

  const txId = await pushBTCpmt(txHex, networkType);

  return { isSuccess: true, data: txId };
}
