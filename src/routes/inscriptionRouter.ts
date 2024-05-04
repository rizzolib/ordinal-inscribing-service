import { Request, Response, Router } from "express";
import { imageInscribe } from "src/home/imageInscribe";
import { textInscribe } from "src/home/textInscribe";

import fileUpload from'express-fileupload';
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
            const receiveAddress = req.body.receiveAddress;
            const content = req.body.content;

            const txId = await textInscribe(
                receiveAddress,
                content
            )
            res.send({ tx: txId })
        } catch (error: any) {
            console.error(error);
            return res.status(500).send({ error });
        }
    }
);

// @route    POST api/image-inscription
// @desc     Image Inscription
// @access   Private
InscriptionRouter.post(
    "/image-inscribe",
    async (req: Request, res: Response) => {
        try {
            if (req.files === null) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }
            const file: IFile = req.files?.file as IFile;
            const mimetype: any = file?.mimetype;
            const data: any = file?.data;
            const receiveAddress = '';

            const txId = await imageInscribe(
                mimetype,
                receiveAddress,
                data
            )
            res.send({ tx: txId })
        } catch (error: any) {
            console.error(error);
            return res.status(500).send({ error });
        }
    }
);