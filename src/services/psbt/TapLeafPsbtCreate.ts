import {
  Transaction,
  script,
  payments,
  initEccLib,
  networks,
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import { toXOnly } from "../../utils/buffer";
import networkConfig, {
  DELEGATE_CONTENT,
  FILE_CONTENT,
  TESTNET,
  TEXT_CONTENT,
} from "../../config/network.config";
import ecc from "@bitcoinerlab/secp256k1";
import wallet from "../wallet/initializeWallet";
import { reinscriptionAndUTXOSend } from "../utxo/utxo.reinscribe.singleSend";
import { singleSendUTXO } from "../utxo/utxo.singleSend";
import { IUtxo } from "utils/types";

initEccLib(ecc as any);

const network =
  networkConfig.networkType == TESTNET ? networks.testnet : networks.bitcoin;
const keyPair = wallet.ecPair;

export const tapleafPsbt = async (
  contentType: string,
  inscriptionData: any,
  tapScript: Array<any>,
  userUtxo: IUtxo,
  amount: number
): Promise<Transaction> => {
  const ordinal_script = script.compile(tapScript);

  const scriptTree: Taptree = {
    output: ordinal_script,
  };

  const redeem = {
    output: ordinal_script,
    redeemVersion: 192,
  };

  const ordinal_p2tr = payments.p2tr({
    internalPubkey: toXOnly(keyPair.publicKey),
    network,
    scriptTree,
    redeem,
  });
  const address: string = ordinal_p2tr.address ?? "";
  let res: any = {};

  let inscriptionAmount: number = 0;
  if (contentType == TEXT_CONTENT)
    inscriptionAmount = inscriptionData.contents.length;
  if (contentType == FILE_CONTENT)
    inscriptionAmount = inscriptionData.files.length;
  if (contentType == DELEGATE_CONTENT)
    inscriptionAmount = inscriptionData.delegateIds.length;

  if (inscriptionData.reinscriptionId && inscriptionAmount == 1) {
    res = await reinscriptionAndUTXOSend(
      inscriptionData.reinscriptionId,
      address,
      inscriptionData.feeRate,
      userUtxo,
      amount,
      inscriptionData.holderStatus
    );
  } else {
    res = await singleSendUTXO(
      address,
      inscriptionData.feeRate,
      userUtxo,
      amount,
      inscriptionData.holderStatus
    );
  }

  if (!res.isSuccess) {
    console.log(res.data);
  }

  return res.data;
};
export default tapleafPsbt;
