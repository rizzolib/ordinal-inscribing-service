import { Request, Response, Router } from "express";
import { IFile, ITextInscription, IFileInscription, IDelegateInscription } from "../utils/types";

// Create a new instance of the Inscription Router
export const InscriptionRouter = Router();

// @route    POST api/inscribe/text
// @desc     Text Inscription Fee
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
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata: JSON = JSON.parse(req.body.metadata);
                const contents: Array<string> = req.body.contents.split(',');
                const textInscriptionData: ITextInscription = { ...req.body, feeRate: feeRate, padding: padding, metadata: metadata, contents: contents }
                
                console.log('textInscriptionData =>', textInscriptionData)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error: error });
        }
    }
);

// @route    POST api/inscribe/file
// @desc     File Inscription Fee
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
                const fileData = req.files?.files as any;
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
                
                console.log('fileInscriptionData => ', fileInscriptionData)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/inscribe/delegate
// @desc     Delegate Inscription Fee
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
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata: JSON = JSON.parse(req.body.metadata);
                const delegateInscriptionData: IDelegateInscription = { ...req.body, feeRate: feeRate, padding: padding, metadata: metadata }
                
                console.log('delegateInscriptionData =>', delegateInscriptionData)
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error: error });
        }
    }
);
