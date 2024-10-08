import { Request, Response, Router } from "express";
import { getPrice, getFeeRate, getRecommendedFeeRate } from "../utils/mempool";
import networkConfig from "../config/network.config";

// Create a new instance of the Express Router
export const StatusNetworkRoute = Router();

// @route    GET api/status/price
// @desc     Get Bitcoin price
// @access   Public
StatusNetworkRoute.get("/price", async (req: Request, res: Response) => {
  try {
    const response = await getPrice(networkConfig.networkType);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(400).send({ error });
  }
});

// @route    GET api/status/avgFeeRate
// @desc     Get Fee Rate
// @access   Public
StatusNetworkRoute.get("/avgFeeRate", async (req: Request, res: Response) => {
  try {
    await getFeeRate(networkConfig.networkType, res);
  } catch (error: any) {
    return res.status(400).send({ error });
  }
});

// @route    GET api/status/recomFeeRate
// @desc     Get Recommended Fee Rate
// @access   Public
StatusNetworkRoute.get(
  "/recommendFeeRate",
  async (req: Request, res: Response) => {
    try {
      const recommendFeeRate = await getRecommendedFeeRate(
        networkConfig.networkType
      );
      res.status(200).send({ recommendFeeRate });
    } catch (error: any) {
      res.status(400).send({ error });
    }
  }
);
