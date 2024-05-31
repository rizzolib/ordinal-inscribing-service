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
exports.SendOrdinalRouter = void 0;
const express_1 = require("express");
const inscribe_controller_1 = require("../controller/inscribe.controller");
const validationAddress_1 = require("../utils/validationAddress");
// Create a new instance of the Inscription Router
exports.SendOrdinalRouter = (0, express_1.Router)();
// @route    POST api/inscribe/text
// @desc     Inscribe Text Inscription
// @access   Private
exports.SendOrdinalRouter.post("/getSendingOrdinalPsbt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(req.body.receiveAddress && (req.body.parentId || req.body.reinscriptionId) && req.body.feeRate && req.body.btcAmount && req.body.publicKey)) {
            let error = [];
            if (!req.body.receiveAddress) {
                error.push({ receiveAddress: 'ReceiveAddress is required' });
            }
            if (!(req.body.parentId || req.body.reinscriptionId)) {
                error.push({ inscriptionId: 'inscriptionId is required' });
            }
            if (!req.body.feeRate) {
                error.push({ feeRate: 'FeeRate is required' });
            }
            if (!req.body.btcAmount) {
                error.push({ btcAmount: 'BtcAmount is required' });
            }
            if (!req.body.publicKey) {
                error.push({ publicKey: 'PublicKey is required' });
            }
            res.status(400).send({ error: { type: 0, data: error } });
        }
        else {
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res.status(400).send({ type: 2, data: 'This address is not valid address.' });
            }
            const feeRate = +req.body.feeRate;
            const btcAmount = +req.body.btcAmount;
            const publicKey = req.body.publicKey;
            let parentId = '';
            let reinscriptionId = '';
            if (req.body.parentId) {
                parentId = req.body.parentId;
            }
            if (req.body.reinscriptionId) {
                reinscriptionId = req.body.reinscriptionId;
            }
            const sendOrdinalRequestData = {
                receiveAddress: req.body.receiveAddress,
                parentId: parentId,
                reinscriptionId: reinscriptionId,
                feeRate: feeRate,
                btcAmount: btcAmount,
                publicKey: publicKey
            };
            yield (0, inscribe_controller_1.SendingOrdinalController)(sendOrdinalRequestData, res);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
