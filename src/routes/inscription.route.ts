import { Request, Response, Router } from "express";
import {
  IFile,
  ITextInscription,
  IFileInscription,
  IDelegateInscription,
} from "../utils/types";
import {
  TextInscribeController,
  DelegateInscribeController,
  FileInscribeController,
} from "../controller/inscribe.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";

// Create a new instance of the Inscription Router
export const InscriptionRouter = Router();

// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
InscriptionRouter.post("/text", async (req: Request, res: Response) => {
  try {
    if (
      !(
        req.body.receiveAddress &&
        req.body.textContent &&
        req.body.networkFee &&
        req.body.padding
      )
    ) {
      let error = [];
      if (!req.body.receiveAddress) {
        error.push({ receiveAddress: "ReceiveAddress is required" });
      }
      if (!req.body.textContent) {
        error.push({ contents: "Content is required" });
      }
      if (!req.body.networkFee) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }

      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        const feeRate: number = +req.body.networkFee;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;
        const contents: Array<string> = req.body.textContent.split("\n");

        let txIndex = 0;
        if (req.body.parentId) {
          txIndex++;
        }
        if (req.body.reinscriptionId) {
          txIndex++;
        }

        const holderStatus: boolean = req.body.holderStatus ?? false;

        const textInscriptionData: ITextInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          metadata: metadata,
          contents: contents,
          txIndex: txIndex,
          holderStatus: holderStatus,
        };

        await TextInscribeController(textInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error });
  }
});

// @route    POST api/inscribe/file
// @desc     Inscribe File Inscription
// @access   Private
InscriptionRouter.post("/file", async (req: Request, res: Response) => {
  try {
    if (!(req.body.receiveAddress && req.body.networkFee && req.body.padding)) {
      let error = [];
      if (!req.body.receiveAddress) {
        error.push({ receiveAddress: "ReceiveAddress is required" });
      }
      if (!req.body.networkFee) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }

      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        let files = req.files as any;
        let fileData = files["files[]"];

        if (!Array.isArray(fileData)) {
          fileData = [fileData];
        }
        const fileArray: Array<IFile> = fileData.map((item: any) => {
          return {
            mimetype: item.mimetype,
            data: item.data,
          };
        });
        const feeRate: number = +req.body.networkFee;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;

        let txIndex = 0;
        if (req.body.parentId) {
          txIndex++;
        }
        if (req.body.reinscriptionId) {
          txIndex++;
        }

        const holderStatus: boolean = req.body.holderStatus ?? false;
        const fileInscriptionData: IFileInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          files: fileArray,
          metadata: metadata,
          txIndex: txIndex,
          holderStatus: holderStatus,
        };

        await FileInscribeController(fileInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error });
  }
});

// @route    POST api/inscribe/delegate
// @desc     Inscribe Delegate Inscription Fee
// @access   Private
InscriptionRouter.post("/delegate", async (req: Request, res: Response) => {
  try {
    if (
      !(
        req.body.receiveAddress &&
        req.body.delegateId &&
        req.body.networkFee &&
        req.body.padding
      )
    ) {
      let error = [];
      if (!req.body.receiveAddress) {
        error.push({ receiveAddress: "ReceiveAddress is required" });
      }
      if (!req.body.delegateId) {
        error.push({ delegateId: "DelegateId is required" });
      }
      if (!req.body.networkFee) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }

      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        const feeRate: number = +req.body.networkFee;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;
        const delegateIds: Array<string> = req.body.delegateId.split(",");

        let txIndex = 0;
        if (req.body.parentId) {
          txIndex++;
        }
        if (req.body.reinscriptionId) {
          txIndex++;
        }

        const holderStatus: boolean = req.body.holderStatus ?? false;

        const delegateInscriptionData: IDelegateInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          metadata: metadata,
          delegateIds: delegateIds,
          txIndex: txIndex,
          holderStatus: holderStatus,
        };

        await DelegateInscribeController(delegateInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error: error });
  }
});
