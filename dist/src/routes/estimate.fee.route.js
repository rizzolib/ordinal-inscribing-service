"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateFeeRouter = void 0;
const express_1 = require("express");
const estimate_controller_1 = require("../controller/estimate.controller");
const validationAddress_1 = require("../utils/validationAddress");
const unisat_api_1 = require("../utils/unisat.api");
const network_config_1 = __importDefault(require("../config/network.config"));
// Create a new instance of the Estimation Fee Router
exports.EstimateFeeRouter = (0, express_1.Router)();
// @route    POST api/estimate/text
// @desc     Estimate Text Inscription Fee
// @access   Private
exports.EstimateFeeRouter.post("/text", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(req.body.receiveAddress &&
            req.body.contents &&
            req.body.feeRate &&
            req.body.padding)) {
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
        }
        else {
            if (req.body.reinscriptionId || req.body.parentId) {
                let reinscriptionIdInfo = {};
                let parentIdInfo = {};
                if (req.body.reinscriptionId) {
                    reinscriptionIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.reinscriptionId, network_config_1.default.networkType);
                    if (!reinscriptionIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Reinscription Id is not vaild on ${network_config_1.default.networkType}`,
                        });
                    }
                }
                if (req.body.parentId) {
                    parentIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.parentId, network_config_1.default.networkType);
                    if (!parentIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Parent Id is not vaild on ${network_config_1.default.networkType}`,
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
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                const feeRate = +req.body.feeRate;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                const contents = JSON.parse(req.body.contents).data;
                const holderStatus = (_a = req.body.holderStatus) !== null && _a !== void 0 ? _a : false;
                const textInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, contents: contents, holderStatus: holderStatus });
                yield (0, estimate_controller_1.TextEstimateFeeController)(textInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
// @route    POST api/estimate/file
// @desc     Estimate File Inscription Fee
// @access   Private
exports.EstimateFeeRouter.post("/file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        console.log(req.files);
        if (!(req.body.receiveAddress &&
            ((_b = req.files) === null || _b === void 0 ? void 0 : _b.files) &&
            req.body.feeRate &&
            req.body.padding)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: "ReceiveAddress is required" });
            }
            if (!((_c = req.files) === null || _c === void 0 ? void 0 : _c.files)) {
                error.push({ file: "File is required" });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: "FeeRate is required" });
            }
            if (!req.body.padding) {
                error.push({ padding: "Padding is required" });
            }
            res.status(400).send({ error: { type: 0, data: error } });
        }
        else {
            if (req.body.reinscriptionId || req.body.parentId) {
                let reinscriptionIdInfo = {};
                let parentIdInfo = {};
                if (req.body.reinscriptionId) {
                    reinscriptionIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.reinscriptionId, network_config_1.default.networkType);
                    if (!reinscriptionIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Reinscription Id is not vaild on ${network_config_1.default.networkType}`,
                        });
                    }
                }
                if (req.body.parentId) {
                    parentIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.parentId, network_config_1.default.networkType);
                    if (!parentIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Parent Id is not vaild on ${network_config_1.default.networkType}`,
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
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                let fileData = (_d = req.files) === null || _d === void 0 ? void 0 : _d.files;
                if (!Array.isArray(fileData)) {
                    fileData = [fileData];
                }
                const fileArray = fileData.map((item) => {
                    return {
                        mimetype: item.mimetype,
                        data: item.data,
                    };
                });
                const feeRate = +req.body.feeRate;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                const holderStatus = (_e = req.body.holderStatus) !== null && _e !== void 0 ? _e : false;
                const fileInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, files: fileArray, metadata: metadata, holderStatus: holderStatus });
                yield (0, estimate_controller_1.FileEstimateFeeController)(fileInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
// @route    POST api/estimate/delegate
// @desc     Estimate Delegate Inscription Fee
// @access   Private
exports.EstimateFeeRouter.post("/delegate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        if (!(req.body.receiveAddress &&
            req.body.delegateId &&
            req.body.feeRate &&
            req.body.padding)) {
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
        }
        else {
            if (req.body.reinscriptionId || req.body.parentId) {
                let reinscriptionIdInfo = {};
                let parentIdInfo = {};
                let delegateIdInfo = {};
                if (req.body.reinscriptionId) {
                    reinscriptionIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.reinscriptionId, network_config_1.default.networkType);
                    if (!reinscriptionIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Reinscription Id is not vaild on ${network_config_1.default.networkType}`,
                        });
                    }
                }
                if (req.body.parentId) {
                    parentIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.parentId, network_config_1.default.networkType);
                    if (!parentIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Parent Id is not vaild on ${network_config_1.default.networkType}`,
                        });
                    }
                }
                if (req.body.delegateId) {
                    delegateIdInfo = yield (0, unisat_api_1.getInscriptionInfo)(req.body.delegateId, network_config_1.default.networkType);
                    if (!delegateIdInfo) {
                        return res.status(400).send({
                            type: 3,
                            data: `Delegate Id is not vaild on ${network_config_1.default.networkType}`,
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
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                const feeRate = +req.body.feeRate;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                const delegateIds = req.body.delegateId.split(",");
                const holderStatus = (_f = req.body.holderStatus) !== null && _f !== void 0 ? _f : false;
                const delegateInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, delegateIds: delegateIds, holderStatus: holderStatus });
                yield (0, estimate_controller_1.DelegateEstimateFeeController)(delegateInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error: error });
    }
}));
