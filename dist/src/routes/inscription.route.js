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
exports.InscriptionRouter = void 0;
const express_1 = require("express");
const inscribe_controller_1 = require("../controller/inscribe.controller");
const validationAddress_1 = require("../utils/validationAddress");
// Create a new instance of the Inscription Router
exports.InscriptionRouter = (0, express_1.Router)();
// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
exports.InscriptionRouter.post("/text", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(req.body.receiveAddress &&
            req.body.textContent &&
            req.body.networkFee &&
            req.body.padding)) {
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
        }
        else {
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                const feeRate = +req.body.networkFee;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                const contents = req.body.textContent.split("\n");
                let txIndex = 0;
                if (req.body.parentId) {
                    txIndex++;
                }
                if (req.body.reinscriptionId) {
                    txIndex++;
                }
                const holderStatus = (_a = req.body.holderStatus) !== null && _a !== void 0 ? _a : false;
                const textInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, contents: contents, txIndex: txIndex, holderStatus: holderStatus });
                yield (0, inscribe_controller_1.TextInscribeController)(textInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
// @route    POST api/inscribe/file
// @desc     Inscribe File Inscription
// @access   Private
exports.InscriptionRouter.post("/file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
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
        }
        else {
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                let files = req.files;
                let fileData = files["files[]"];
                if (!Array.isArray(fileData)) {
                    fileData = [fileData];
                }
                const fileArray = fileData.map((item) => {
                    return {
                        mimetype: item.mimetype,
                        data: item.data,
                    };
                });
                const feeRate = +req.body.networkFee;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                let txIndex = 0;
                if (req.body.parentId) {
                    txIndex++;
                }
                if (req.body.reinscriptionId) {
                    txIndex++;
                }
                const holderStatus = (_b = req.body.holderStatus) !== null && _b !== void 0 ? _b : false;
                const fileInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, files: fileArray, metadata: metadata, txIndex: txIndex, holderStatus: holderStatus });
                yield (0, inscribe_controller_1.FileInscribeController)(fileInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
// @route    POST api/inscribe/delegate
// @desc     Inscribe Delegate Inscription Fee
// @access   Private
exports.InscriptionRouter.post("/delegate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        if (!(req.body.receiveAddress &&
            req.body.delegateId &&
            req.body.networkFee &&
            req.body.padding)) {
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
        }
        else {
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                const feeRate = +req.body.networkFee;
                const padding = +req.body.padding;
                const metadata = req.body.metadata;
                const delegateIds = req.body.delegateId.split(",");
                let txIndex = 0;
                if (req.body.parentId) {
                    txIndex++;
                }
                if (req.body.reinscriptionId) {
                    txIndex++;
                }
                const holderStatus = (_c = req.body.holderStatus) !== null && _c !== void 0 ? _c : false;
                const delegateInscriptionData = Object.assign(Object.assign({}, req.body), { feeRate: feeRate, padding: padding, metadata: metadata, delegateIds: delegateIds, txIndex: txIndex, holderStatus: holderStatus });
                yield (0, inscribe_controller_1.DelegateInscribeController)(delegateInscriptionData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error: error });
    }
}));
