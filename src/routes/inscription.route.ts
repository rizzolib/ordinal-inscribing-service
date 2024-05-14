import { Request, Response, Router } from "express";
import { inscribe } from "../home/controller/inscribe.controller";

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

// @route    POST api/text-inscribe
// @desc     Text Inscription
// @access   Private
InscriptionRouter.post(
    "/text-inscribe",
    async (req: Request, res: Response) => {
        try {
            if (!(req.body.receiveAddress && req.body.content && req.body.feeRate)) {
                let error = [];
                if (!req.body.receiveAddress) { error.push({ receiveAddress: 'Receive Address is required' }) }
                if (!req.body.content) { error.push({ content: 'Content is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }

                res.status(400).send(error)
            } else {
                const receiveAddress = req.body.receiveAddress;
                const content = req.body.content;
                const feeRate = req.body.feeRate;
                const txId = await inscribe(
                    'text',
                    'text/plain',
                    receiveAddress,
                    content,
                    feeRate
                );
                res.send({ tx: txId })
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    POST api/file-inscription
// @desc     File Inscription
// @access   Private
InscriptionRouter.post(
    "/file-inscribe",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }

            const receiveAddress = req.body.receiveAddress;
            const feeRate = req.body.feeRate;

            const file: IFile = req.files?.file as IFile;
            const mimetype: string = file?.mimetype;
            const content: Buffer = file?.data;

            const txId = await inscribe(
                'text',
                'text/plain',
                receiveAddress,
                content,
                feeRate
            );
            res.send({ tx: txId })
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);
