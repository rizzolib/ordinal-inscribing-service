import { ITextInscription, IFileInscription, IDelegateInscription } from "../utils/types";
import { Response } from "express";
import { fileTapScript } from "../services/tapscript/fileTapScript";
import { textTapScript } from "../services/tapscript/textTapScript";
import { inscriptionPsbt } from "../services/psbt/inscriptionPsbt";
import { DELEGATE_CONTENT, FILE_CONTENT, TEXT_CONTENT } from "../config/network.config";
import { Transaction } from "bitcoinjs-lib";
import { delegateTapScript } from "../services/tapscript/delegateTapScript";
import networkConfig from "../config/network.config";
import { pushBTCpmt } from "../utils/mempool";
import { setUtxoFlag } from "../utils/mutex";
import { splitUTXO } from "../services/utxo/utxo.split";
import tapleafPsbt from "../services/psbt/TapLeafPsbt";

export const TextInscribeController = async (inscriptionData: ITextInscription, res: Response) => {
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

        const tapleafTxData: Transaction = await tapleafPsbt(contentType, inscriptionData, tapScript, sendUTXOSize);

        const txid = await pushBTCpmt(tapleafTxData.toHex(), networkConfig.networkType);

        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        }

        console.log('Sent Utxo for inscribing => ', sendingUtxo)

        const realInscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sendingUtxo);

        const realInscriptiontxId = await pushBTCpmt(realInscriptionTxData.toHex(), networkConfig.networkType);

        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId)

        const response = await splitUTXO()
        console.log(response)
        
        return res.status(200).send({
            tx: realInscriptiontxId
        });

    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}

export const FileInscribeController = async (inscriptionData: IFileInscription, res: Response) => {
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

        const tapleafTxData: Transaction = await tapleafPsbt(contentType, inscriptionData, tapScript, sendUTXOSize);

        const txid = await pushBTCpmt(tapleafTxData.toHex(), networkConfig.networkType);

        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        }

        console.log('Sent Utxo for inscribing => ', sendingUtxo)

        const realInscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sendingUtxo);

        const realInscriptiontxId = await pushBTCpmt(realInscriptionTxData.toHex(), networkConfig.networkType);

        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId)

        const response = await splitUTXO()
        console.log(response)
        
        return res.status(200).send({
            tx: realInscriptiontxId
        });

    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}

export const DelegateInscribeController = async (inscriptionData: IDelegateInscription, res: Response) => {
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

        const tapleafTxData: Transaction = await tapleafPsbt(contentType, inscriptionData, tapScript, sendUTXOSize);

        const txid = await pushBTCpmt(tapleafTxData.toHex(), networkConfig.networkType);

        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        }

        console.log('Sent Utxo for inscribing => ', sendingUtxo)

        const realInscriptionTxData: Transaction = await inscriptionPsbt(contentType, inscriptionData, tapScript, sendingUtxo);

        const realInscriptiontxId = await pushBTCpmt(realInscriptionTxData.toHex(), networkConfig.networkType);

        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId)

        const response = await splitUTXO()
        console.log(response)

        return res.status(200).send({
            tx: realInscriptiontxId
        });

    } catch (error) {
        await setUtxoFlag(0);
        console.log(error);
        return res.status(400).send({ error });
    }
}