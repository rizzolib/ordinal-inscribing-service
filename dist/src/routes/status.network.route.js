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
exports.StatusNetworkRoute = void 0;
const express_1 = require("express");
const mempool_1 = require("../utils/mempool");
const network_config_1 = __importDefault(require("../config/network.config"));
// Create a new instance of the Express Router
exports.StatusNetworkRoute = (0, express_1.Router)();
// @route    GET api/status/price
// @desc     Get Bitcoin price
// @access   Public
exports.StatusNetworkRoute.get("/price", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, mempool_1.getPrice)(network_config_1.default.networkType);
        return res.status(200).send(response);
    }
    catch (error) {
        return res.status(400).send({ error });
    }
}));
// @route    GET api/status/avgFeeRate
// @desc     Get Fee Rate
// @access   Public
exports.StatusNetworkRoute.get("/avgFeeRate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mempool_1.getFeeRate)(network_config_1.default.networkType, res);
    }
    catch (error) {
        return res.status(400).send({ error });
    }
}));
// @route    GET api/status/recomFeeRate
// @desc     Get Recommended Fee Rate
// @access   Public
exports.StatusNetworkRoute.get("/recommendFeeRate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recommendFeeRate = yield (0, mempool_1.getRecommendedFeeRate)(network_config_1.default.networkType);
        res.status(200).send({ recommendFeeRate });
    }
    catch (error) {
        res.status(400).send({ error });
    }
}));
