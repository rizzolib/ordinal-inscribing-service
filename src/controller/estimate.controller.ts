import {
  ITextInscription,
  IFileInscription,
  IDelegateInscription,
} from "../utils/types";
import { Response } from "express";
import { fileTapScript } from "../services/tapscript/fileTapScript";
import { textTapScript } from "../services/tapscript/textTapScript";
import { inscriptionPsbt } from "../services/psbt/inscriptionPsbt";
import {
  DELEGATE_CONTENT,
  FILE_CONTENT,
  TEXT_CONTENT,
} from "../config/network.config";
import { Transaction } from "bitcoinjs-lib";
import tapleafPsbt from "../services/psbt/TapLeafPsbtCreate";
import { toInteger } from "../utils/math";
import { delegateTapScript } from "../services/tapscript/delegateTapScript";

export const TextEstimateFeeController = async (
  inscriptionData: ITextInscription,
  res: Response
) => {
  try {
    const tapScript = await textTapScript(inscriptionData);

    const sentUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 1000000,
    };
    const contentType = TEXT_CONTENT;

    const redeemInscriptionData = {
      ...inscriptionData,
      ordinalsAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      ordinalsPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
      paymentAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      paymentPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
    };
    const inscriptionTxData: Transaction = await inscriptionPsbt(
      contentType,
      redeemInscriptionData,
      tapScript,
      sentUtxo
    );

    const sendUTXOSize =
      inscriptionTxData.virtualSize() * inscriptionData.feeRate +
      inscriptionData.contents.length * inscriptionData.padding;

    const userUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 10 * 10 ** 8,
    };
    const tapleafTxData: Transaction = await tapleafPsbt(
      contentType,
      inscriptionData,
      tapScript,
      userUtxo,
      sendUTXOSize
    );

    const totalFee =
      tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
    const total =
      inscriptionData.padding * inscriptionData.contents.length +
      totalFee +
      toInteger(totalFee / 50) +
      toInteger(totalFee / 20);
    return res.status(200).send({
      satsInItem: inscriptionData.padding * inscriptionData.contents.length,
      fee: totalFee,
      serviceFee: toInteger(totalFee / 50),
      feeBySize: toInteger(totalFee / 20),
      total: total,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error });
  }
};

export const FileEstimateFeeController = async (
  inscriptionData: IFileInscription,
  res: Response
) => {
  try {
    const tapScript = await fileTapScript(inscriptionData);

    const sentUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 1000000,
    };
    const contentType = FILE_CONTENT;

    const redeemInscriptionData = {
      ...inscriptionData,
      ordinalsAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      ordinalsPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
      paymentAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      paymentPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
    };
    const inscriptionTxData: Transaction = await inscriptionPsbt(
      contentType,
      redeemInscriptionData,
      tapScript,
      sentUtxo
    );

    const sendUTXOSize =
      inscriptionTxData.virtualSize() * inscriptionData.feeRate +
      inscriptionData.files.length * inscriptionData.padding;

    const userUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 10 * 10 ** 8,
    };

    const tapleafTxData: Transaction = await tapleafPsbt(
      contentType,
      inscriptionData,
      tapScript,
      userUtxo,
      sendUTXOSize
    );

    const totalFee =
      tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
    const total =
      inscriptionData.padding * inscriptionData.files.length +
      totalFee +
      toInteger(totalFee / 50) +
      toInteger(totalFee / 20);
    return res.status(200).send({
      satsInItem: inscriptionData.padding * inscriptionData.files.length,
      fee: totalFee,
      serviceFee: toInteger(totalFee / 50),
      feeBySize: toInteger(totalFee / 20),
      total: total,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error });
  }
};

export const DelegateEstimateFeeController = async (
  inscriptionData: IDelegateInscription,
  res: Response
) => {
  try {
    const tapScript = await delegateTapScript(inscriptionData);

    const sentUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 1000000,
    };
    const contentType = DELEGATE_CONTENT;

    const redeemInscriptionData = {
      ...inscriptionData,
      ordinalsAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      ordinalsPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
      paymentAddress:
        "tb1p0sd5xq6sz0eg3r9j5df0qk38pgnuqreav2qqtq5jfvwpk3yhzuxqjyttjy",
      paymentPublicKey:
        "cde4d7fa3f66b13c61279a3a78fd3623428bc69d7e65c770a0fdfd6ea3b0758d",
    };
    const inscriptionTxData: Transaction = await inscriptionPsbt(
      contentType,
      redeemInscriptionData,
      tapScript,
      sentUtxo
    );

    const sendUTXOSize =
      inscriptionTxData.virtualSize() * inscriptionData.feeRate +
      inscriptionData.delegateIds.length * inscriptionData.padding;

    const userUtxo = {
      txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
      vout: 0,
      value: 10 * 10 ** 8,
    };

    const tapleafTxData: Transaction = await tapleafPsbt(
      contentType,
      inscriptionData,
      tapScript,
      userUtxo,
      sendUTXOSize
    );

    const totalFee =
      tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
    const total =
      inscriptionData.padding * inscriptionData.delegateIds.length +
      totalFee +
      toInteger(totalFee / 50) +
      toInteger(totalFee / 20);
    return res.status(200).send({
      satsInItem: inscriptionData.padding * inscriptionData.delegateIds.length,
      fee: totalFee,
      serviceFee: toInteger(totalFee / 50),
      feeBySize: toInteger(totalFee / 20),
      total: total,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error });
  }
};
