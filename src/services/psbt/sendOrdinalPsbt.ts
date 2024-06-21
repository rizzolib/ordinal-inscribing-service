import {
  Psbt,
  networks,
  payments,
  script,
  initEccLib,
  crypto,
  address as Address,
} from "bitcoinjs-lib";
import { ISendingOrdinalData, IUtxo } from "../../utils/types";
import { toXOnly } from "../../utils/buffer";
import networkConfig, {
  SEND_UTXO_FEE_LIMIT,
  TESTNET,
} from "../../config/network.config";
import wallet from "../wallet/initializeWallet";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory, ECPairAPI } from "ecpair";
import { getUtxos } from "../../utils/mempool";
import { getSendBTCUTXOArray } from "../../services/utxo/utxo.management";
import {
  OrdinalsUtxoSendPsbt,
  RedeemOrdinalsUtxoSendPsbt,
} from "../../services/utxo/utxo.ordinalsSendPsbt";
import { getBtcUtxoInfo } from "../../utils/unisat.api";

initEccLib(ecc as any);
const ECPair: ECPairAPI = ECPairFactory(ecc);

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
    return { isSuccess: false, data: "No enough balance on your wallet." };
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
      return { isSuccess: false, data: "No enough balance on your wallet." };
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
