import { Request, Response, Router } from "express";
import { feeEstimate } from "../controller/fee.estimate.controller";
import { receiveMessageOnPort } from "worker_threads";

// Create a new instance of the Express Router
export const FeeEstimateRoute = Router();

interface IFile {
    mimetype: string,
    data: Buffer
}

// @route    GET api/inscribe
// @desc     API test
// @access   Public
FeeEstimateRoute.get(
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

// @route    POST api/estimate/text-estimate-fee
// @desc     Text Inscription
// @access   Private
FeeEstimateRoute.post(
    "/text-estimate-fee",
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

                const fee = await feeEstimate(
                    'text',
                    'text/plain',
                    content,
                    feeRate,
                    padding,
                    'tb1pxa7j0z4s0ns6vm532z9qnv292mnvhuc05nxd69zns9rcxqegcunq6wrmjl'
                );
                res.status(200).send({ fee: fee })
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error: error });
        }
    }
);

// @route    POST api/estimate/file-estimate-fee
// @desc     File Inscription
// @access   Private
FeeEstimateRoute.post(
    "/file-estimate-fee",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            if (!(req.body.padding && req.body.feeRate)) {
                let error = [];
                if (!req.body.padding) { error.push({ padding: 'Padding is required' }) }
                if (!req.body.feeRate) { error.push({ feeRate: 'FeeRate is required' }) }
                res.status(400).send({ error: { type: 0, data: error } })
            } else {
                const feeRate: number = +req.body.feeRate;
                const padding: number = +req.body.padding;
                const file: IFile = req.files?.file as IFile;
                const mimetype: string = file?.mimetype;
                const content: Buffer = file?.data;

                const fee = await feeEstimate(
                    'file',
                    mimetype,
                    content,
                    feeRate,
                    padding,
                    'tb1pxa7j0z4s0ns6vm532z9qnv292mnvhuc05nxd69zns9rcxqegcunq6wrmjl'
                );
                res.status(200).send({ fee: fee })
            }
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);
