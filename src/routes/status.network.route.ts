import { Request, Response, Router } from "express";
import { getPrice, getFeeRate, getRecommendedFeeRate } from "../utils/mempool";
import networkConfig from "../config/network.config";

// Create a new instance of the Express Router
export const StatusNetworkRoute = Router();


// @route    GET api/status/price
// @desc     Get Bitcoin price
// @access   Public
StatusNetworkRoute.get(
    "/price",
    async (req: Request, res: Response) => {
        try {
            const response = await getPrice(networkConfig.networkType);
            return res.status(200).send(response);
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);

// @route    GET api/status/avgFeeRate
// @desc     Get Fee Rate
// @access   Public
StatusNetworkRoute.get(
    "/avgFeeRate",
    async (req: Request, res: Response) => {
        try {
            const response = await getFeeRate(networkConfig.networkType);
            return res.status(200).send(response);
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);


// @route    GET api/status/recomFeeRate
// @desc     Get Recommended Fee Rate
// @access   Public
StatusNetworkRoute.get(
    "/recomFeeRate",
    async (req: Request, res: Response) => {
        try {
            const response = await getRecommendedFeeRate(networkConfig.networkType);
            return res.status(200).send(response);
        } catch (error: any) {
            console.error(error);
            return res.status(400).send({ error });
        }
    }
);