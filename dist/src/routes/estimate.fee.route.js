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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateFeeRouter = void 0;
const express_1 = require("express");
const estimate_controller_1 = require("../controller/estimate.controller");
// Create a new instance of the Estimation Fee Router
exports.EstimateFeeRouter = (0, express_1.Router)();
// @route    POST api/estimate/text
// @desc     Estimate Text Inscription Fee
// @access   Private
exports.EstimateFeeRouter.post("/text", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(req.body.receiveAddress && req.body.contents && req.body.feeRate && req.body.padding)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: 'ReceiveAddress is required' });
            }
            if (!req.body.contents) {
                error.push({ contents: 'Content is required' });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: 'FeeRate is required' });
            }
            if (!req.body.padding) {
                error.push({ padding: 'Padding is required' });
            }
            res.status(400).send({ error: { type: 0, data: error } });
        }
        else {
            const feeRate = +req.body.feeRate;
            const padding = +req.body.padding;
            const metadata = JSON.parse(req.body.metadata);
            const contents = req.body.contents.split(',');
            const textInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, contents: contents });
            yield (0, estimate_controller_1.TextEstimateFeeController)(textInscriptionData, res);
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
    var _a, _b, _c;
    try {
        if (!(req.body.receiveAddress && ((_a = req.files) === null || _a === void 0 ? void 0 : _a.files) && req.body.feeRate && req.body.padding)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: 'ReceiveAddress is required' });
            }
            if (!((_b = req.files) === null || _b === void 0 ? void 0 : _b.files)) {
                error.push({ file: 'File is required' });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: 'FeeRate is required' });
            }
            if (!req.body.padding) {
                error.push({ padding: 'Padding is required' });
            }
            res.status(400).send({ error: { type: 0, data: error } });
        }
        else {
            let fileData = (_c = req.files) === null || _c === void 0 ? void 0 : _c.files;
            if (!Array.isArray(fileData)) {
                fileData = [fileData];
            }
            const fileArray = fileData.map((item) => {
                return {
                    mimetype: item.mimetype,
                    data: item.data
                };
            });
            const feeRate = +req.body.feeRate;
            const padding = +req.body.padding;
            const metadata = JSON.parse(req.body.metadata);
            const fileInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, files: fileArray, metadata: metadata });
            yield (0, estimate_controller_1.FileEstimateFeeController)(fileInscriptionData, res);
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
    try {
        if (!(req.body.receiveAddress && req.body.delegateId && req.body.feeRate && req.body.padding)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: 'ReceiveAddress is required' });
            }
            if (!req.body.delegateId) {
                error.push({ delegateId: 'DelegateId is required' });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: 'FeeRate is required' });
            }
            if (!req.body.padding) {
                error.push({ padding: 'Padding is required' });
            }
            res.status(400).send({ error: { type: 0, data: error } });
        }
        else {
            const feeRate = +req.body.feeRate;
            const padding = +req.body.padding;
            const metadata = JSON.parse(req.body.metadata);
            const delegateIds = req.body.delegateId.split(',');
            const delegateInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, delegateIds: delegateIds });
            yield (0, estimate_controller_1.DelegateEstimateFeeController)(delegateInscriptionData, res);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error: error });
    }
}));
