import networkConfig from "../config/network.config";
import { getUtxos, pushBTCpmt } from "../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { redeemSendUTXOPsbt, sendUTXOPsbt } from "../utils/utxo/utxo.send";
import { SeedWallet } from "../utils/wallet/SeedWallet";
import { WIFWallet } from '../utils/wallet/WIFWallet'

const SEND_UTXO_LIMIT = 1000;

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: any;

if (networkConfig.walletType == 'WIF') {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == 'SEED') {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}


export const sendUTXO = async (address: string, feeRate: number, amount: number) => {
  const utxos = await getUtxos(wallet.address, networkType);
  const utxo = utxos.find((utxo) => utxo.value > amount + SEND_UTXO_LIMIT);

  if (utxo === undefined) return { isSuccess: false, data: 'No enough balance on admin wallet.' };

  let redeemPsbt: Bitcoin.Psbt = redeemSendUTXOPsbt(wallet, utxo, networkType, amount);
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
  let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

  const utxo_real: any = utxos.find((utxo) => utxo.value > amount + redeemFee);

  if (utxo_real === undefined) return { isSuccess: false, data: 'No enough balance on admin wallet.' };

  let psbt = sendUTXOPsbt(wallet, utxo_real, networkType, redeemFee, address, amount);
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)

  const txHex = signedPsbt.extractTransaction().toHex();

  const txId = await pushBTCpmt(txHex, networkType);

  return { isSuccess: true, data: txId };;
}


export const sendUTXOEstimateFee = async (feeRate: number, amount: number) => {
  const utxo = {
    txid: 'e2aa2f0e1b49567e3c5e2f5985898657930e9f3ec1580b38429499e318c62b64',
    vout: 0,
    value: 10 * 10 ** 8
  }
  let redeemPsbt: Bitcoin.Psbt = redeemSendUTXOPsbt(wallet, utxo, networkType, amount);
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
  let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

  return redeemFee;
}
