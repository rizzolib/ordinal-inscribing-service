import { Psbt, initEccLib } from "bitcoinjs-lib";
import { ISendingOrdinalData } from "../../utils/types";
import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
} from "../../config/network.config";
import wallet from "../wallet/initializeWallet";
import ecc from "@bitcoinerlab/secp256k1";
import { getSendBTCUTXOArray } from "../../services/utxo/utxo.management";
import {
  OrdinalsUtxoSendPsbt,
  RedeemOrdinalsUtxoSendPsbt,
} from "../../services/utxo/utxo.ordinalsSendPsbt";
import { getBtcUtxoInfo } from "../../utils/unisat.api";

initEccLib(ecc as any);
export const sendOrdinalBTCPsbt = async (
  sendingOrdinalData: ISendingOrdinalData
): Promise<any> => {
  const utxos = await getBtcUtxoInfo(
    sendingOrdinalData.paymentAddress,
    networkConfig.networkType
  );

  let response = getSendBTCUTXOArray(
    utxos,
    sendingOrdinalData.btcAmount + SEND_UTXO_FEE_LIMIT
  );

  if (!response.isSuccess) {
    return { isSuccess: false, data: "Not enough balance on your wallet." };
  }

  let selectedUtxos = response.data;
  let redeemFee = SEND_UTXO_FEE_LIMIT;

  for (let i = 0; i < 3; i++) {
    let redeemPsbt: Psbt = await RedeemOrdinalsUtxoSendPsbt(
      selectedUtxos,
      networkConfig.networkType,
      sendingOrdinalData,
      redeemFee
    );
    redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair);

    redeemFee =
      redeemPsbt.extractTransaction(true).virtualSize() *
      sendingOrdinalData.feeRate;

    response = getSendBTCUTXOArray(
      utxos,
      sendingOrdinalData.btcAmount + redeemFee
    );
    if (!response.isSuccess) {
      return { isSuccess: false, data: "Not enough balance in your wallet." };
    }
    selectedUtxos = response.data;
  }

  let psbt = await OrdinalsUtxoSendPsbt(
    selectedUtxos,
    networkConfig.networkType,
    sendingOrdinalData,
    redeemFee
  );

  return { isSuccess: true, data: psbt };
};
