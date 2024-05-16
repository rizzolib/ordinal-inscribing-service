import { Request, Response, Router } from "express";
import { inscribe } from "../controller/inscribe.controller";

// Create a new instance of the Express Router
export const InscriptionRouter = Router();

interface IFile {
    mimetype: string,
    data: Buffer
}

// @route    GET api/
// @desc     API test
// @access   Public
InscriptionRouter.get(
    "/",
    async (req: Request, res: Response) => {
        try {
            console.log('Inscription router is running')
            return res.json({ msg: 'success' });
        } catch (error: any) {
            console.error(error);
            return res.status(500).send({ error });
        }
    }
);

// @route    POST api/inscribe/text
// @desc     Text Inscription
// @access   Private
InscriptionRouter.post(
    "/text",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.content && req.body.feeRate)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.content) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const receiveAddress = req.body.receiveAddress;
                const content = req.body.content;
                const feeRate = req.body.feeRate;

                const response = await inscribe(
                    'text',
                    'text/plain',
                    receiveAddress,
                    content,
                    feeRate
                );
                if (response.isSuccess) {
                    res.status(200).send({ tx: response.data })
                } else {
                    res.status(400).send({ error: { type: 1, data: response.data } })
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
InscriptionRouter.post(
    "/file",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            if (!(req.body.receiveAddress && req.body.feeRate)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const receiveAddress = req.body.receiveAddress;
                const feeRate = req.body.feeRate;
                const file: IFile = req.files?.file as IFile;
                const mimetype: string = file?.mimetype;
                const content: Buffer = file?.data;

                const response = await inscribe(
                    'file',
                    mimetype,
                    receiveAddress,
                    content,
                    feeRate
                );
                if (response.isSuccess) {
                    res.status(200).send({ tx: response.data })
                } else {
                    res.status(400).send({ error: { type: 1, data: response.data } })
                }
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);
