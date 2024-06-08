import { Request, Response, Router } from "express";
import { ISendingOrdinalData } from "../utils/types";
import { SendingOrdinalController } from "../controller/inscribe.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";
import { getBtcUtxoInfo } from "../utils/unisat.api";
import { TESTNET } from "../config/network.config";

// Create a new instance of the Inscription Router
export const SendOrdinalRouter = Router();

// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
SendOrdinalRouter.post(
  "/getSendingOrdinalBtcPsbt",
  async (req: Request, res: Response) => {
    try {
      if (
        !(
          req.body.receiveAddress &&
          (req.body.parentId || req.body.reinscriptionId) &&
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
        if (!(req.body.parentId || req.body.reinscriptionId)) {
          error.push({ inscriptionId: "InscriptionId is required" });
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
            parentId = req.body.parentId;
          }
          if (req.body.reinscriptionId) {
            reinscriptionId = req.body.reinscriptionId;
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
    const data = await getBtcUtxoInfo(
      "tb1prapjugegwv9safaremcuprnzt4q3gwz6wdh4qf7qfst7jxt3x6wq2cznt3",
      TESTNET
    );

    res.status(200).send({
      data: data,
    });
  } catch (error: any) {
    console.log({ error });
  }
});
