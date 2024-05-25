import { Request, Response, Router } from "express";
import { childInscribe } from "../controller/child.inscribe.controller";
import { childInscribeBulkText } from "../controller/child.inscribe.bulk.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";

// Create a new instance of the Express Router
export const ChildInscriptionRouter = Router();

interface IFile {
    mimetype: string,
    data: Buffer
}

// @route    POST api/child-inscribe/text
// @desc     Text Inscription
// @access   Private
ChildInscriptionRouter.post(
    "/text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.content && req.body.feeRate && req.body.padding && req.body.parentId)) {
                let error = [];
                if (!req.body.parentId) { error.push({ parentId: 'ParentId is required' }) }
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.content) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ error: { type: 2, data: 'This address is not valid address.' } })
                } else {
                    const parentId = req.body.parentId;
                    const receiveAddress = req.body.receiveAddress;
                    const content = req.body.content;
                    const feeRate = req.body.feeRate;
                    const padding = req.body.padding;
                    const metadata = req.body.metadata ? req.body.metadata : '';
                    const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';

                    const response = await childInscribe(
                        parentId,
                        'text',
                        'text/plain',
                        receiveAddress,
                        content,
                        feeRate,
                        padding,
                        metadata,
                        metaprotocol
                    );
                    if (response.isSuccess) {
                        res.status(200).send({ tx: response.txid })
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/child-inscribe/bulk-text
// @desc     Text Inscription
// @access   Private

ChildInscriptionRouter.post(
    "/bulk-text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.contents && req.body.feeRate && req.body.padding && req.body.parentId)) {
                let error = [];
                if (!req.body.parentId) { error.push({ parentId: 'ParentId is required' }) }
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.contents) { error.push({ contents: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ error: { type: 2, data: 'This address is not valid address.' } })
                } else {
                    const parentId = req.body.parentId;
                    const receiveAddress = req.body.receiveAddress;
                    const contents = JSON.parse(req.body.contents).data;
                    const feeRate = req.body.feeRate;
                    const padding = req.body.padding;
                    const metadata = req.body.metadata ? req.body.metadata : '';
                    const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';

                    const response = await childInscribeBulkText(
                        parentId,
                        'text/plain',
                        receiveAddress,
                        contents,
                        feeRate,
                        padding,
                        metadata,
                        metaprotocol
                    );
                    if (response.isSuccess) {
                        res.status(200).send({ tx: response.txid })
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
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
ChildInscriptionRouter.post(
    "/file",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            if (!(req.body.receiveAddress && req.body.feeRate && req.body.padding && req.body.parentId)) {
                let error = [];
                if (!req.body.parentId) { error.push({ parentId: 'ParentId is required' }) }
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                if (!isValidBitcoinAddress(req.body.receiveAddress)) {
                    res.status(400).send({ error: { type: 2, data: 'This address is not valid address.' } })
                } else {
                    const parentId = req.body.parentId;
                    const receiveAddress = req.body.receiveAddress;
                    const feeRate: number = +req.body.feeRate;
                    const padding: number = +req.body.padding;
                    const metadata = req.body.metadata ? req.body.metadata : '';
                    const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';
                    const file: IFile = req.files?.file as IFile;
                    const mimetype: string = file?.mimetype;
                    const content: Buffer = file?.data;

                    const response = await childInscribe(
                        parentId,
                        'file',
                        mimetype,
                        receiveAddress,
                        content,
                        feeRate,
                        padding,
                        metadata,
                        metaprotocol
                    );
                    if (response.isSuccess) {
                        res.status(200).send({ tx: response.txid })
                    } else {
                        res.status(400).send({ error: { type: 1, data: response.data } })
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);
