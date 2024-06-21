import { Request, Response, Router } from "express";
import { ISendingOrdinalData } from "../utils/types";
import { SendingOrdinalController } from "../controller/inscribe.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";
import { isContainOrdinal, testUnisatAPI } from "../utils/unisat.api";
import networkConfig, { TESTNET } from "../config/network.config";

// Create a new instance of the Inscription Router
export const SendOrdinalRouter = Router();

// @route    POST api/inscribe/getSendingOrdinalBtcPsbt
// @desc     Inscribe Text Inscription
// @access   Private
SendOrdinalRouter.post(
  "/getSendingOrdinalBtcPsbt",
  async (req: Request, res: Response) => {
    try {
      if (
        !(
          req.body.receiveAddress &&
          req.body.networkFee &&
          req.body.paymentAddress &&
          req.body.paymentPublicKey &&
          req.body.ordinalsAddress &&
          req.body.ordinalsPublicKey &&
          req.body.btcAmount
        )
      ) {
        let error = [];
        if (!req.body.receiveAddress) {
          error.push({ receiveAddress: "ReceiveAddress is required" });
        }
        if (!req.body.networkFee) {
          error.push({ feeRate: "FeeRate is required" });
        }
        if (!req.body.btcAmount) {
          error.push({ btcAmount: "btcAmount is required" });
        }
        if (!req.body.paymentAddress) {
          error.push({ publicKey: "Payment Address is required" });
        }

        if (!req.body.paymentPublicKey) {
          error.push({ publicKey: "Payment PublicKey is required" });
        }

        if (!req.body.ordinalsAddress) {
          error.push({ publicKey: "Ordinals Address is required" });
        }

        if (!req.body.ordinalsPublicKey) {
          error.push({ publicKey: "Ordinals Public Key is required" });
        }

        res.status(400).send({ error: { type: 0, data: error } });
      } else {
        if (!isValidBitcoinAddress(req.body.receiveAddress)) {
          res
            .status(400)
            .send({ type: 2, data: "This address is not valid address." });
        } else {
          const feeRate: number = +req.body.networkFee;
          let parentId: string = "";
          let reinscriptionId: string = "";

          if (req.body.parentId) {
            const isContainOrdinalStatus = await isContainOrdinal(
              req.body.parentId,
              req.body.ordinalsAddress,
              networkConfig.networkType
            );

            if (!isContainOrdinalStatus) {
              return res.status(400).send({
                type: 5,
                data: `Parent Id does not contain on ${req.body.ordinalsAddress}`,
              });
            } else {
              parentId = req.body.parentId;
            }
          }
          if (req.body.reinscriptionId) {
            const isContainOrdinalStatus = await isContainOrdinal(
              req.body.reinscriptionId,
              req.body.ordinalsAddress,
              networkConfig.networkType
            );

            if (!isContainOrdinalStatus) {
              return res.status(400).send({
                type: 5,
                data: `Reinscription Id does not contain on ${req.body.ordinalsAddress}`,
              });
            } else {
              reinscriptionId = req.body.reinscriptionId;
            }
          }

          const sendOrdinalRequestData: ISendingOrdinalData = {
            paymentAddress: req.body.paymentAddress,
            paymentPublicKey: req.body.paymentPublicKey,
            ordinalsAddress: req.body.ordinalsAddress,
            ordinalsPublicKey: req.body.ordinalsPublicKey,
            receiveAddress: req.body.receiveAddress,
            parentId: parentId,
            reinscriptionId: reinscriptionId,
            feeRate: feeRate,
            btcAmount: req.body.btcAmount,
          };
          await SendingOrdinalController(sendOrdinalRequestData, res);
        }
      }
    } catch (error: any) {
      console.error(error);
      return res.status(400).send({ error });
    }
  }
);

SendOrdinalRouter.get("/test", async (req: Request, res: Response) => {
  try {
    const data = await testUnisatAPI(
      "tb1pymgsee4syh7ez4g9pm7gu0ax8wfj4wukwlxykfwnn6gx2tcr4r7quhsdlh",
      TESTNET
    );

    res.status(200).send({
      data: data,
    });
  } catch (error: any) {
    console.log({ error });
  }
});
