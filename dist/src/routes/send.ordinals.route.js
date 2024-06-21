"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const unisat_api_1 = require("../utils/unisat.api");
const network_config_1 = __importStar(require("../config/network.config"));
// Create a new instance of the Inscription Router
exports.SendOrdinalRouter = (0, express_1.Router)();
// @route    POST api/inscribe/getSendingOrdinalBtcPsbt
// @desc     Inscribe Text Inscription
// @access   Private
exports.SendOrdinalRouter.post("/getSendingOrdinalBtcPsbt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(req.body.receiveAddress &&
            req.body.networkFee &&
            req.body.paymentAddress &&
            req.body.paymentPublicKey &&
            req.body.ordinalsAddress &&
            req.body.ordinalsPublicKey &&
            req.body.btcAmount)) {
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
        }
        else {
            if (!(0, validationAddress_1.isValidBitcoinAddress)(req.body.receiveAddress)) {
                res
                    .status(400)
                    .send({ type: 2, data: "This address is not valid address." });
            }
            else {
                const feeRate = +req.body.networkFee;
                let parentId = "";
                let reinscriptionId = "";
                if (req.body.parentId) {
                    const isContainOrdinalStatus = yield (0, unisat_api_1.isContainOrdinal)(req.body.parentId, req.body.ordinalsAddress, network_config_1.default.networkType);
                    if (!isContainOrdinalStatus) {
                        return res.status(400).send({
                            type: 5,
                            data: `Parent Id does not contain on ${req.body.ordinalsAddress}`,
                        });
                    }
                    else {
                        parentId = req.body.parentId;
                    }
                }
                if (req.body.reinscriptionId) {
                    const isContainOrdinalStatus = yield (0, unisat_api_1.isContainOrdinal)(req.body.reinscriptionId, req.body.ordinalsAddress, network_config_1.default.networkType);
                    if (!isContainOrdinalStatus) {
                        return res.status(400).send({
                            type: 5,
                            data: `Reinscription Id does not contain on ${req.body.ordinalsAddress}`,
                        });
                    }
                    else {
                        reinscriptionId = req.body.reinscriptionId;
                    }
                }
                const sendOrdinalRequestData = {
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
                yield (0, inscribe_controller_1.SendingOrdinalController)(sendOrdinalRequestData, res);
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
exports.SendOrdinalRouter.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, unisat_api_1.testUnisatAPI)("tb1pymgsee4syh7ez4g9pm7gu0ax8wfj4wukwlxykfwnn6gx2tcr4r7quhsdlh", network_config_1.TESTNET);
        res.status(200).send({
            data: data,
        });
    }
    catch (error) {
        console.log({ error });
    }
}));
