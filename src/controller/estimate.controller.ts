import { ITextInscription } from "../utils/types";
import { Response } from "express";
import { textTapScript } from "../services/tapscript/textTapScript";
import { inscriptionPsbt } from "../services/psbt/inscriptionPsbt";
import { TEXT_CONTENT } from "../config/network.config";
import { Transaction } from "bitcoinjs-lib";
import { tapleafPsbt } from "../services/psbt/tapleafpsbt";
import { toInteger } from "../utils/math";

export const TextEstimateFeeController = async (inscriptionData: ITextInscription, res: Response) => {

    const tapScript = await textTapScript(inscriptionData);

    const sentUtxo = {
        txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
        vout: 0,
        value: 1000000
    }
    const contentType = TEXT_CONTENT;

    const inscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sentUtxo);

    const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.contents.length * inscriptionData.padding;

    const tapleafTxData: Transaction = await tapleafPsbt(inscriptionData, tapScript, sendUTXOSize);

    const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;

    res.status(200).send({
        satsInItem: inscriptionData.padding * inscriptionData.contents.length,
        fee: totalFee,
        serviceFee: toInteger(totalFee / 50),
        feeBySize: toInteger(totalFee / 20)
    });

}