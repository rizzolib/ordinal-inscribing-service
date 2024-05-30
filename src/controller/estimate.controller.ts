import { ITextInscription, IFileInscription, IDelegateInscription } from "../utils/types";
import { Response } from "express";
import { fileTapScript } from "../services/tapscript/fileTapScript";
import { textTapScript } from "../services/tapscript/textTapScript";
import { inscriptionPsbt } from "../services/psbt/inscriptionPsbt";
import { DELEGATE_CONTENT, FILE_CONTENT, TEXT_CONTENT } from "../config/network.config";
import { Transaction } from "bitcoinjs-lib";
import { tapleafPsbt } from "../services/psbt/tapleafpsbt";
import { toInteger } from "../utils/math";
import { delegateTapScript } from "../services/tapscript/delegateTapScript";
import { setUtxoFlag } from "../utils/mutex";

export const TextEstimateFeeController = async (inscriptionData: ITextInscription, res: Response) => {
    try {
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

        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.contents.length,
            fee: totalFee,
            serviceFee: toInteger(totalFee / 50),
            feeBySize: toInteger(totalFee / 20)
        });
    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}

export const FileEstimateFeeController = async (inscriptionData: IFileInscription, res: Response) => {
    try {
        const tapScript = await fileTapScript(inscriptionData);

        const sentUtxo = {
            txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
            vout: 0,
            value: 1000000
        }
        const contentType = FILE_CONTENT;

        const inscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sentUtxo);

        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.files.length * inscriptionData.padding;

        const tapleafTxData: Transaction = await tapleafPsbt(inscriptionData, tapScript, sendUTXOSize);

        const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;

        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.files.length,
            fee: totalFee,
            serviceFee: toInteger(totalFee / 50),
            feeBySize: toInteger(totalFee / 20)
        });
    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}

export const DelegateEstimateFeeController = async (inscriptionData: IDelegateInscription, res: Response) => {
    try {
        const tapScript = await delegateTapScript(inscriptionData);

        const sentUtxo = {
            txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
            vout: 0,
            value: 1000000
        }
        const contentType = DELEGATE_CONTENT;

        const inscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sentUtxo);

        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.delegateIds.length * inscriptionData.padding;

        const tapleafTxData: Transaction = await tapleafPsbt(inscriptionData, tapScript, sendUTXOSize);

        const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;

        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.delegateIds.length,
            fee: totalFee,
            serviceFee: toInteger(totalFee / 50),
            feeBySize: toInteger(totalFee / 20)
        });
    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}