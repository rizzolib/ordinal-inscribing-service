import networkConfig from "../config/network.config";
import { getUtxos, pushBTCpmt } from "../utils/mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { redeemSendUTXOPsbt, sendUTXOPsbt} from "../utils/utxo/utxo.send";
import { SeedWallet } from "../utils/wallet/SeedWallet";
import { WIFWallet } from '../utils/wallet/WIFWallet'

const SEND_UTXO_LIMIT = 1000;

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: any;

if (networkConfig.walletType == 'WIF') {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  const wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == 'WIF') {
  const seed: string = process.env.MNEMONIC as string;
  const wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

export const sendUTXO = async (address: string, feeRate: number, amount: number) => {
  const utxos = await getUtxos(wallet.address, networkType);
  const utxo = utxos.find((utxo) => utxo.value > amount + SEND_UTXO_LIMIT);
  if (utxo === undefined) throw new Error("No btcs");

  let redeemPsbt: Bitcoin.Psbt = redeemSendUTXOPsbt(wallet, utxo, networkType, amount);
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
  let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

  const utxos_real = await getUtxos(wallet.address, networkType);
  const utxo_real: any = utxos_real.find((utxo) => utxo.value > amount + redeemFee);
  if (utxo === undefined) throw new Error("No btcs");

  let psbt = sendUTXOPsbt(wallet, utxo_real, networkType, redeemFee, address, amount);
  let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)
  
  const txHex = signedPsbt.extractTransaction().toHex();

  const txId = await pushBTCpmt(txHex, networkType);
  
  return txId;
}
