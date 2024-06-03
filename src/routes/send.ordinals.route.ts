import { Request, Response, Router } from "express";
import { ISendingOrdinalData } from "../utils/types";
import { SendingOrdinalController } from "../controller/inscribe.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";
import { getBtcUtxoInfo } from "../utils/unisat.api";
import { TESTNET } from "../config/network.config";

// Create a new instance of the Inscription Router
export const SendOrdinalRouter = Router();

// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
SendOrdinalRouter.post(
    "/getSendingOrdinalBtcPsbt",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && (req.body.parentId || req.body.reinscriptionId) && req.body.feeRate && req.body.btcAmount && req.body.publicKey)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'ReceiveAddress is required' }) }
                if (!(req.body.parentId || req.body.reinscriptionId)) { error.push({ inscriptionId: 'inscriptionId is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.btcAmount) { error.push({ btcAmount: 'BtcAmount is required' }) }
                if (!req.body.publicKey) { error.push({ publicKey: 'PublicKey is required' }) }

                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ type: 2, data: 'This address is not valid address.' })
                } else {
                    const feeRate: number = +req.body.feeRate;
                    const btcAmount: number = +req.body.btcAmount;
                    const publicKey: string = req.body.publicKey;
                    let parentId: string = '';
                    let reinscriptionId: string = '';
    
                    if (req.body.parentId) {
                        parentId = req.body.parentId;
                    }
                    if (req.body.reinscriptionId) {
                        reinscriptionId = req.body.reinscriptionId;
                    }
    
                    const sendOrdinalRequestData: ISendingOrdinalData = {
                        receiveAddress: req.body.receiveAddress,
                        parentId: parentId,
                        reinscriptionId: reinscriptionId,
                        feeRate: feeRate,
                        btcAmount: btcAmount,
                        publicKey: publicKey
                    }
                    await SendingOrdinalController(sendOrdinalRequestData, res)
                }
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

SendOrdinalRouter.get(
    "/test",
    async (req: Request, res: Response) => {
        try {
            const data = await getBtcUtxoInfo('tb1prapjugegwv9safaremcuprnzt4q3gwz6wdh4qf7qfst7jxt3x6wq2cznt3', TESTNET);
            
            res.status(200).send({
                data: data
            })
        } catch (error: any) {
            console.log({ error })
        }
    })