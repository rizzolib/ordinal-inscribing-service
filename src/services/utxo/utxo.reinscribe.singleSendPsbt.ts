import * as Bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { TESTNET } from "../../config/network.config";

Bitcoin.initEccLib(ecc);

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

export const redeemReinscribeAndUtxoSendPsbt = (
  wallet: any,
  userUtxo: IUtxo,
  networkType: string,
  amount: number,
  reinscriptionUTXO: IUtxo,
  fee: number,
  holderStatus: boolean
): Bitcoin.Psbt => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });
  psbt.addInput({
    hash: reinscriptionUTXO.txid,
    index: reinscriptionUTXO.vout,
    witnessUtxo: {
      value: reinscriptionUTXO.value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });
  psbt.addInput({
    hash: userUtxo.txid,
    index: userUtxo.vout,
    witnessUtxo: {
      value: userUtxo.value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });

  psbt.addOutput({
    address: wallet.address,
    value: amount,
  });
  if (!holderStatus) {
    psbt.addOutput({
      address: wallet.address,
      value: userUtxo.value + reinscriptionUTXO.value - fee - amount,
    });
  }

  return psbt;
};

export const ReinscribeAndUtxoSendPsbt = (
  wallet: any,
  userUtxo: IUtxo,
  networkType: string,
  fee: number,
  address: string,
  amount: number,
  reinscriptionUTXO: IUtxo,
  holderStatus: boolean
): Bitcoin.Psbt => {
  const psbt = new Bitcoin.Psbt({
    network:
      networkType == TESTNET
        ? Bitcoin.networks.testnet
        : Bitcoin.networks.bitcoin,
  });

  psbt.addInput({
    hash: reinscriptionUTXO.txid,
    index: reinscriptionUTXO.vout,
    witnessUtxo: {
      value: reinscriptionUTXO.value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });

  psbt.addInput({
    hash: userUtxo.txid,
    index: userUtxo.vout,
    witnessUtxo: {
      value: userUtxo.value,
      script: wallet.output,
    },
    tapInternalKey: Buffer.from(wallet.publicKey, "hex").subarray(1, 33),
  });

  psbt.addOutput({
    address: address,
    value: amount,
  });

  if (!holderStatus) {
    psbt.addOutput({
      address: wallet.address,
      value: userUtxo.value + reinscriptionUTXO.value - fee - amount,
    });
  }
  return psbt;
};
