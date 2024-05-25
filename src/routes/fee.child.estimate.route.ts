import { Request, Response, Router } from "express";
import { FeechildInscribe } from "../controller/fee.child.estimate.controller";
import { FeechildBulkInscribe } from "../controller/fee.child.bulk.estimate.controller";
import { toInteger } from "../utils/math";

// Create a new instance of the Express Router
export const FeeChildInscriptionRouter = Router();

interface IFile {
    mimetype: string,
    data: Buffer
}

// @route    POST api/child-inscribe/text
// @desc     Text Inscription
// @access   Private
FeeChildInscriptionRouter.post(
    "/child-text-estimate-fee",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.content && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.content) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const content = req.body.content;
                const feeRate = req.body.feeRate;
                const padding = req.body.padding;
                const metadata = req.body.metadata ? req.body.metadata : '';
                const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';

                const response = await FeechildInscribe(
                    'text',
                    'text/plain',
                    content,
                    feeRate,
                    padding,
                    metadata,
                    metaprotocol
                );
                let fee: number = 0;
                if (response.isSuccess) {
                    fee = response.data;
                    res.status(200).send({
                        satsInItem: toInteger(padding),
                        networkFee: toInteger(fee),
                        serviceBaseFee: toInteger(fee / 50),
                        feeBySize: toInteger(fee / 20),
                        total: toInteger(fee + padding + fee / 50 + fee / 20)
                    })
                } else {
                    res.status(400).send({
                        isSuccess: response.isSuccess,
                        data: response.data
                    })
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

FeeChildInscriptionRouter.post(
    "/child-bulk-text-estimate-fee",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.contents && req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.contents) { error.push({ contents: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const contents = JSON.parse(req.body.contents).data;
                const feeRate = req.body.feeRate;
                const padding = req.body.padding;
                const metadata = req.body.metadata ? req.body.metadata : '';
                const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';

                const response = await FeechildBulkInscribe(
                    'text/plain',
                    contents,
                    feeRate,
                    padding,
                    metadata,
                    metaprotocol
                );
                let fee: number = 0;
                if (response.isSuccess) {
                    fee = response.data;
                    res.status(200).send({
                        satsInItem: toInteger(padding),
                        networkFee: toInteger(fee),
                        serviceBaseFee: toInteger(fee / 50),
                        feeBySize: toInteger(fee / 20),
                        total: toInteger(fee + padding + fee / 50 + fee / 20)
                    })
                } else {
                    res.status(400).send({
                        isSuccess: response.isSuccess,
                        data: response.data
                    })
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
FeeChildInscriptionRouter.post(
    "/child-file-estimate-fee",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            if (!(req.body.feeRate && req.body.padding)) {
                let error = [];
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const metadata = req.body.metadata ? req.body.metadata : '';
                const metaprotocol = req.body.metaprotocol ? req.body.metaprotocol : '';
                const file: IFile = req.files?.file as IFile;
                const mimetype: string = file?.mimetype;
                const content: Buffer = file?.data;

                const response = await FeechildInscribe(
                    'file',
                    mimetype,
                    content,
                    feeRate,
                    padding,
                    metadata,
                    metaprotocol
                );
                let fee: number = 0;
                if (response.isSuccess) {
                    fee = response.data;
                    res.status(200).send({
                        satsInItem: toInteger(padding),
                        networkFee: toInteger(fee),
                        serviceBaseFee: toInteger(fee / 50),
                        feeBySize: toInteger(fee / 20),
                        total: toInteger(fee + padding + fee / 50 + fee / 20)
                    })
                } else {
                    res.status(400).send({
                        isSuccess: response.isSuccess,
                        data: response.data
                    })
                }
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);