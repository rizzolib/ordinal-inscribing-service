import { Request, Response, Router } from "express";
import {
  IFile,
  ITextInscription,
  IFileInscription,
  IDelegateInscription,
} from "../utils/types";
import {
  DelegateEstimateFeeController,
  FileEstimateFeeController,
  TextEstimateFeeController,
} from "../controller/estimate.controller";
import { isValidBitcoinAddress } from "../utils/validationAddress";
import { getInscriptionInfo } from "../utils/unisat.api";
import networkConfig from "../config/network.config";

// Create a new instance of the Estimation Fee Router
export const EstimateFeeRouter = Router();

// @route    POST api/estimate/text
// @desc     Estimate Text Inscription Fee
// @access   Private
EstimateFeeRouter.post("/text", async (req: Request, res: Response) => {
  try {
    if (
      !(
        req.body.receiveAddress &&
        req.body.contents &&
        req.body.feeRate &&
        req.body.padding
      )
    ) {
      let error = [];
      if (!req.body.receiveAddress) {
        error.push({ receiveAddress: "ReceiveAddress is required" });
      }
      if (!req.body.contents) {
        error.push({ contents: "Content is required" });
      }
      if (!req.body.feeRate) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }
      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (req.body.reinscriptionId || req.body.parentId) {
        let reinscriptionIdInfo: any = {};
        let parentIdInfo: any = {};
        if (req.body.reinscriptionId) {
          reinscriptionIdInfo = await getInscriptionInfo(
            req.body.reinscriptionId,
            networkConfig.networkType
          );
          if (!reinscriptionIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Reinscription Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }
        if (req.body.parentId) {
          parentIdInfo = await getInscriptionInfo(
            req.body.parentId,
            networkConfig.networkType
          );
          if (!parentIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Parent Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }
        if (req.body.reinscriptionId === req.body.parentId) {
          return res.status(400).send({
            type: 4,
            data: `Reinscription id should not be same with parent inscription id.`,
          });
        }
      }
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        const feeRate: number = +req.body.feeRate;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;
        const contents: Array<string> = JSON.parse(req.body.contents).data;
        const holderStatus: boolean = req.body.holderStatus ?? false;

        const textInscriptionData: ITextInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          metadata: metadata,
          contents: contents,
          holderStatus: holderStatus,
        };

        await TextEstimateFeeController(textInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error });
  }
});

// @route    POST api/estimate/file
// @desc     Estimate File Inscription Fee
// @access   Private
EstimateFeeRouter.post("/file", async (req: Request, res: Response) => {
  try {
    console.log(req.files);
    if (
      !(
        req.body.receiveAddress &&
        req.files?.files &&
        req.body.feeRate &&
        req.body.padding
      )
    ) {
      let error = [];
      if (!req.body.receiveAddress) {
        error.push({ receiveAddress: "ReceiveAddress is required" });
      }
      if (!req.files?.files) {
        error.push({ file: "File is required" });
      }
      if (!req.body.feeRate) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }

      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (req.body.reinscriptionId || req.body.parentId) {
        let reinscriptionIdInfo: any = {};
        let parentIdInfo: any = {};
        if (req.body.reinscriptionId) {
          reinscriptionIdInfo = await getInscriptionInfo(
            req.body.reinscriptionId,
            networkConfig.networkType
          );
          if (!reinscriptionIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Reinscription Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }
        if (req.body.parentId) {
          parentIdInfo = await getInscriptionInfo(
            req.body.parentId,
            networkConfig.networkType
          );
          if (!parentIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Parent Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }
        if (req.body.reinscriptionId === req.body.parentId) {
          return res.status(400).send({
            type: 4,
            data: `Reinscription id should not be same with parent inscription id.`,
          });
        }
      }
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        let fileData = req.files?.files as any;
        if (!Array.isArray(fileData)) {
          fileData = [fileData];
        }

        const fileArray: Array<IFile> = fileData.map((item: any) => {
          return {
            mimetype: item.mimetype,
            data: item.data,
          };
        });
        const feeRate: number = +req.body.feeRate;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;

        const holderStatus: boolean = req.body.holderStatus ?? false;

        const fileInscriptionData: IFileInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          files: fileArray,
          metadata: metadata,
          holderStatus: holderStatus,
        };

        await FileEstimateFeeController(fileInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error });
  }
});

// @route    POST api/estimate/delegate
// @desc     Estimate Delegate Inscription Fee
// @access   Private
EstimateFeeRouter.post("/delegate", async (req: Request, res: Response) => {
  try {
    if (
      !(
        req.body.receiveAddress &&
        req.body.delegateId &&
        req.body.feeRate &&
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
      if (!req.body.feeRate) {
        error.push({ feeRate: "FeeRate is required" });
      }
      if (!req.body.padding) {
        error.push({ padding: "Padding is required" });
      }

      res.status(400).send({ error: { type: 0, data: error } });
    } else {
      if (req.body.reinscriptionId || req.body.parentId) {
        let reinscriptionIdInfo: any = {};
        let parentIdInfo: any = {};
        let delegateIdInfo: any = {};

        if (req.body.reinscriptionId) {
          reinscriptionIdInfo = await getInscriptionInfo(
            req.body.reinscriptionId,
            networkConfig.networkType
          );
          if (!reinscriptionIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Reinscription Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }

        if (req.body.parentId) {
          parentIdInfo = await getInscriptionInfo(
            req.body.parentId,
            networkConfig.networkType
          );
          if (!parentIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Parent Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }

        if (req.body.delegateId) {
          delegateIdInfo = await getInscriptionInfo(
            req.body.delegateId as string,
            networkConfig.networkType
          );
          if (!delegateIdInfo) {
            return res.status(400).send({
              type: 3,
              data: `Delegate Id is not vaild on ${networkConfig.networkType}`,
            });
          }
        }

        if (req.body.reinscriptionId === req.body.parentId) {
          return res.status(400).send({
            type: 4,
            data: `Reinscription id should not be same with parent inscription id.`,
          });
        }
      }
      if (!isValidBitcoinAddress(req.body.receiveAddress)) {
        res
          .status(400)
          .send({ type: 2, data: "This address is not valid address." });
      } else {
        const feeRate: number = +req.body.feeRate;
        const padding: number = +req.body.padding;
        const metadata: string = req.body.metadata;
        const delegateIds: Array<string> = req.body.delegateId.split(",");

        const holderStatus: boolean = req.body.holderStatus ?? false;

        const delegateInscriptionData: IDelegateInscription = {
          ...req.body,
          feeRate: feeRate,
          padding: padding,
          metadata: metadata,
          delegateIds: delegateIds,
          holderStatus: holderStatus,
        };
        await DelegateEstimateFeeController(delegateInscriptionData, res);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.status(400).send({ error: error });
  }
});
