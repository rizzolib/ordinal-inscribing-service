import { Request, Response, Router } from "express";
import { IFile, ITextInscription, IFileInscription, IDelegateInscription } from "../utils/types";
import { TextInscribeController, DelegateInscribeController, FileInscribeController, } from "../controller/inscribe.controller";
import { isValidBitcoinAddress } from "utils/validationAddress";

// Create a new instance of the Inscription Router
export const InscriptionRouter = Router();

// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
InscriptionRouter.post(
    "/text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.contents && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'ReceiveAddress is required' }) }
                if (!req.body.contents) { error.push({ contents: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }

                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ type: 2, data: 'This address is not valid address.' })
                }
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata: JSON = JSON.parse(req.body.metadata);
                const contents: Array<string> = req.body.contents.split(',');
                const textInscriptionData: ITextInscription = { ...req.body, feeRate: feeRate, padding: padding, metadata: metadata, contents: contents }

                await TextInscribeController(textInscriptionData, res)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/inscribe/file
// @desc     Inscribe File Inscription
// @access   Private
InscriptionRouter.post(
    "/file",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.files?.files && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'ReceiveAddress is required' }) }
                if (!req.files?.files) { error.push({ file: 'File is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }

                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ type: 2, data: 'This address is not valid address.' })
                }
                let fileData = req.files?.files as any;
                if (!Array.isArray(fileData)) {
                    fileData = [fileData];
                }

                const fileArray: Array<IFile> = fileData.map((item: any) => {
                    return {
                        mimetype: item.mimetype,
                        data: item.data
                    }
                })
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata: JSON = JSON.parse(req.body.metadata);
                const fileInscriptionData: IFileInscription = { ...req.body, feeRate: feeRate, padding: padding, files: fileArray, metadata: metadata };

                await FileInscribeController(fileInscriptionData, res)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/inscribe/delegate
// @desc     Inscribe Delegate Inscription Fee
// @access   Private
InscriptionRouter.post(
    "/delegate",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.delegateId && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'ReceiveAddress is required' }) }
                if (!req.body.delegateId) { error.push({ delegateId: 'DelegateId is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }

                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ type: 2, data: 'This address is not valid address.' })
                }
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata: JSON = JSON.parse(req.body.metadata);
                const delegateIds: Array<string> = req.body.delegateId.split(',');
                const delegateInscriptionData: IDelegateInscription = { ...req.body, feeRate: feeRate, padding: padding, metadata: metadata, delegateIds: delegateIds }
                
                await DelegateInscribeController(delegateInscriptionData, res)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error: error });
        }
    }
);
