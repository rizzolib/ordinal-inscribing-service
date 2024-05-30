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
exports.WalletManageRoute = void 0;
const express_1 = require("express");
const utxo_split_1 = require("../services/utxo/utxo.split");
// Create a new instance of the Express Router
exports.WalletManageRoute = (0, express_1.Router)();
// @route    GET api/status/recomFeeRate
// @desc     Get Recommended Fee Rate
// @access   Public
exports.WalletManageRoute.get("/utxo-split", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, utxo_split_1.splitUTXO)();
        return res.status(200).send(response);
    }
    catch (error) {
        console.error(error);
        return res.status(400).send({ error });
    }
}));
