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
const inscribe_controller_1 = require("../home/controller/inscribe.controller");
// Create a new instance of the Express Router
exports.InscriptionRouter = (0, express_1.Router)();
// @route    GET api/
// @desc     API test
// @access   Public
exports.InscriptionRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Inscription router is running');
        return res.json({ msg: 'success' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
// @route    POST api/text-inscribe
// @desc     Text Inscription
// @access   Private
exports.InscriptionRouter.post("/text-inscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(req.body.receiveAddress && req.body.content && req.body.feeRate)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: 'Receive Address is required' });
            }
            if (!req.body.content) {
                error.push({ content: 'Content is required' });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: 'FeeRate is required' });
            }
            res.status(400).send(error);
        }
        else {
            const receiveAddress = req.body.receiveAddress;
            const content = req.body.content;
            const feeRate = req.body.feeRate;
            const txId = yield (0, inscribe_controller_1.inscribe)('text', 'text/plain', receiveAddress, content, feeRate);
            res.send({ tx: txId });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
// @route    POST api/file-inscription
// @desc     File Inscription
// @access   Private
exports.InscriptionRouter.post("/file-inscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files === null) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const receiveAddress = req.body.receiveAddress;
        const feeRate = req.body.feeRate;
        const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
        const mimetype = file === null || file === void 0 ? void 0 : file.mimetype;
        const content = file === null || file === void 0 ? void 0 : file.data;
        const txId = yield (0, inscribe_controller_1.inscribe)('text', 'text/plain', receiveAddress, content, feeRate);
        res.send({ tx: txId });
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
