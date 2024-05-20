import networkConfig from "../../config/network.config";
import { getUtxos, pushBTCpmt } from "../mempool";
import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import dotenv from "dotenv";
import { redeemMultiSendPsbt, multiSendPsbt } from "./utxo.multiSendPsbt";
import { SeedWallet } from "../wallet/SeedWallet";
import { WIFWallet } from '../wallet/WIFWallet'
import { getSendBTCUTXOArray } from "./utxo.management";
import { setUtxoFlag, waitUtxoFlag } from "../mutex";

const SEND_UTXO_FEE_LIMIT = 100000;

dotenv.config();
Bitcoin.initEccLib(ecc);

const networkType: string = networkConfig.networkType;
let wallet: WIFWallet | SeedWallet;

if (networkConfig.walletType == 'WIF') {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == 'SEED') {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

export const multiSendUTXO = async (addressArray: any, feeRate: number, amountArray: any) => {
  const totalAmount = amountArray.reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);

  await waitUtxoFlag();
  await setUtxoFlag(1);

  const utxos = await getUtxos(wallet.address, networkType);
  let response = getSendBTCUTXOArray(utxos, totalAmount + SEND_UTXO_FEE_LIMIT);
  if (!response.isSuccess) {
    return { isSuccess: false, data: 'No enough balance on admin wallet.' };
  } else {
    let redeemPsbt: Bitcoin.Psbt = redeemMultiSendPsbt(wallet, response.data, networkType, amountArray);
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
    let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

    response = getSendBTCUTXOArray(utxos, totalAmount + redeemFee);

    if (!response.isSuccess) {
      return { isSuccess: false, data: 'No enough balance on admin wallet.' };
    }

    let psbt = multiSendPsbt(wallet, response.data, networkType, redeemFee, addressArray, amountArray);
    let signedPsbt = wallet.signPsbt(psbt, wallet.ecPair)

    const txHex = signedPsbt.extractTransaction().toHex();

    const txId = await pushBTCpmt(txHex, networkType);

    await setUtxoFlag(0);

    return { isSuccess: true, data: txId };
  }
}