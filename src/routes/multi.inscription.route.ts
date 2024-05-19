import { Request, Response, Router } from "express";
import { inscribe } from "../controller/inscribe.controller";
import { inscribeBulkText } from "../controller/inscribe.bulk.controller";

// Create a new instance of the Express Router
export const MultiInscriptionRouter = Router();

interface IFile {
    mimetype: string,
    data: Buffer
}

// @route    POST api/inscribe/text
// @desc     Text Inscription
// @access   Private
MultiInscriptionRouter.post(
    "/text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.content && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.content) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const receiveAddressList = JSON.parse(req.body.receiveAddress).data;
                const content = req.body.content;
                const feeRate = req.body.feeRate;
                const padding = req.body.padding;
                const txList = [];
                for (let i = 0; i < receiveAddressList.length; i++) {
                    const response = await inscribe(
                        'text',
                        'text/plain',
                        receiveAddressList[i],
                        content,
                        feeRate,
                        padding
                    );
                    if (response.isSuccess) {
                        txList.push(response.data);
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
                res.status(200).send({ tx: txList })

            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/inscribe/bulk-text
// @desc     Text Inscription
// @access   Private
MultiInscriptionRouter.post(
    "/bulk-text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.contents && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.contents) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const receiveAddressList = JSON.parse(req.body.receiveAddress).data;
                const content: Array<string> = JSON.parse(req.body.contents).data;
                const feeRate = req.body.feeRate;
                const padding = req.body.padding;
                const txList = [];
                for (let i = 0; i < receiveAddressList.length; i++) {
                    const response = await inscribeBulkText(
                        receiveAddressList[i],
                        content,
                        feeRate,
                        padding
                    );
                    if (response.isSuccess) {
                        txList.push(response.data);
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
                res.status(200).send({ tx: txList })
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/inscribe/file
// @desc     File Inscription
// @access   Private
MultiInscriptionRouter.post(
    "/file",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            if (!(req.body.receiveAddress && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const receiveAddressList = JSON.parse(req.body.receiveAddress).data;
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const file: IFile = req.files?.file as IFile;
                const mimetype: string = file?.mimetype;
                const content: Buffer = file?.data;
                const txList = [];

                for (let i = 0; i < receiveAddressList.length; i++) {
                    const response = await inscribe(
                        'file',
                        mimetype,
                        receiveAddressList[i],
                        content,
                        feeRate,
                        padding
                    );
                    if (response.isSuccess) {
                        txList.push(response.data);
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
                res.status(200).send({ tx: txList })
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);