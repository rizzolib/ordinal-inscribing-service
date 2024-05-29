
import { Request, Response, Router } from "express";
import { splitUTXO } from "../services/utxo/utxo.split";

// Create a new instance of the Express Router
export const WalletManageRoute = Router();

// @route    GET api/status/recomFeeRate
// @desc     Get Recommended Fee Rate
// @access   Public
WalletManageRoute.get(
    "/utxo-split",
    async (req: Request, res: Response) => {
        try {
            const response = await splitUTXO();
            return res.status(200).send(response);
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);