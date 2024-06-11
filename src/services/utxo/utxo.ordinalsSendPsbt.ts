import * as Bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import networkConfig, { TESTNET } from "../../config/network.config";
import { ISendingOrdinalData } from "../../utils/types";
import { getInscriptionInfo } from "../../utils/unisat.api";
import wallet from "../wallet/initializeWallet";
import { toXOnly } from "../../utils/buffer";

Bitcoin.initEccLib(ecc);

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

export const RedeemOrdinalsUtxoSendPsbt = async (
  selectedUtxos: Array<IUtxo>,
  networkType: string,
  sendingOrdinalData: ISendingOrdinalData,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  const network: Bitcoin.Network =
    networkType == TESTNET
      ? Bitcoin.networks.testnet
      : Bitcoin.networks.bitcoin;

  let inputUtxoSumValue: number = selectedUtxos.reduce(
    (accumulator: number, currentValue: IUtxo) =>
      accumulator + currentValue.value,
    0
  );

  let parentInscriptionUTXO: IUtxo = {
    value: 0,
    txid: "",
    vout: 0,
  };
  let reinscriptionUTXO: IUtxo = {
    value: 0,
    txid: "",
    vout: 0,
  };

  if (sendingOrdinalData.parentId) {
    parentInscriptionUTXO = await getInscriptionInfo(
      sendingOrdinalData.parentId,
      networkConfig.networkType
    );
    psbt.addInput({
      hash: parentInscriptionUTXO.txid,
      index: parentInscriptionUTXO.vout,
      witnessUtxo: {
        value: parentInscriptionUTXO.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  }
  if (sendingOrdinalData.reinscriptionId) {
    reinscriptionUTXO = await getInscriptionInfo(
      sendingOrdinalData.reinscriptionId,
      networkConfig.networkType
    );
    psbt.addInput({
      hash: reinscriptionUTXO.txid,
      index: reinscriptionUTXO.vout,
      witnessUtxo: {
        value: reinscriptionUTXO.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  }

  selectedUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: wallet.output,
      },
      tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
    });
  });

  if (sendingOrdinalData.parentId) {
    psbt.addOutput({
      address: wallet.address,
      value: parentInscriptionUTXO.value,
    });
  }

  if (sendingOrdinalData.reinscriptionId) {
    psbt.addOutput({
      address: wallet.address,
      value: reinscriptionUTXO.value,
    });
  }

  psbt.addOutput({
    address: wallet.address,
    value: sendingOrdinalData.btcAmount,
  });

  psbt.addOutput({
    address: wallet.address,
    value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
  });

  return psbt;
};

export const OrdinalsUtxoSendPsbt = async (
  selectedUtxos: Array<IUtxo>,
  networkType: string,
  sendingOrdinalData: ISendingOrdinalData,
  redeemFee: number
): Promise<Bitcoin.Psbt> => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  const network: Bitcoin.Network =
    networkType == TESTNET
      ? Bitcoin.networks.testnet
      : Bitcoin.networks.bitcoin;

  let inputUtxoSumValue: number = selectedUtxos.reduce(
    (accumulator: number, currentValue: IUtxo) =>
      accumulator + currentValue.value,
    0
  );
  let parentInscriptionUTXO: IUtxo = {
    txid: "",
    vout: 0,
    value: 0,
  };
  let reInscriptionUTXO: IUtxo = {
    txid: "",
    vout: 0,
    value: 0,
  };

  if (sendingOrdinalData.parentId) {
    parentInscriptionUTXO = await getInscriptionInfo(
      sendingOrdinalData.parentId,
      networkConfig.networkType
    );
    psbt.addInput({
      hash: parentInscriptionUTXO.txid,
      index: parentInscriptionUTXO.vout,
      witnessUtxo: {
        value: parentInscriptionUTXO.value,
        script: Bitcoin.address.toOutputScript(
          sendingOrdinalData.ordinalsAddress as string,
          network
        ),
      },
      tapInternalKey: Buffer.from(sendingOrdinalData.ordinalsPublicKey, "hex"),
    });
  }
  if (sendingOrdinalData.reinscriptionId) {
    reInscriptionUTXO = await getInscriptionInfo(
      sendingOrdinalData.reinscriptionId,
      networkConfig.networkType
    );

    psbt.addInput({
      hash: reInscriptionUTXO.txid,
      index: reInscriptionUTXO.vout,
      witnessUtxo: {
        value: reInscriptionUTXO.value,
        script: Bitcoin.address.toOutputScript(
          sendingOrdinalData.ordinalsAddress as string,
          network
        ),
      },
      tapInternalKey: Buffer.from(sendingOrdinalData.ordinalsPublicKey, "hex"),
    });
  }

  selectedUtxos.forEach((utxo) => {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        value: utxo.value,
        script: Bitcoin.address.toOutputScript(
          sendingOrdinalData.paymentAddress as string,
          network
        ),
      },
      tapInternalKey: Buffer.from(sendingOrdinalData.paymentPublicKey, "hex"),
    });
  });

  if (sendingOrdinalData.parentId) {
    psbt.addOutput({
      address: wallet.address,
      value: parentInscriptionUTXO.value,
    });
  }

  if (sendingOrdinalData.reinscriptionId) {
    psbt.addOutput({
      address: wallet.address,
      value: reInscriptionUTXO.value,
    });
  }

  psbt.addOutput({
    address: wallet.address,
    value: sendingOrdinalData.btcAmount,
  });

  psbt.addOutput({
    address: sendingOrdinalData.paymentAddress,
    value: inputUtxoSumValue - redeemFee - sendingOrdinalData.btcAmount,
  });

  return psbt;
};
