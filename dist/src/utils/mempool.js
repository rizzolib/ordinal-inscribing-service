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
exports.getRecommendedFeeRate = exports.getFeeRate = exports.getBlockHeight = exports.getPrice = exports.pushBTCpmt = exports.getUtxos = void 0;
const axios_1 = __importDefault(require("axios"));
const network_config_1 = require("../config/network.config");
const getUtxos = (address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}api/address/${address}/utxo`;
        const res = yield axios_1.default.get(url);
        const confirmedUtxos = [];
        const unConfirmedUtxos = [];
        res.data.forEach((utxoData) => {
            if (utxoData.status.confirmed) {
                confirmedUtxos.push({
                    txid: utxoData.txid,
                    vout: utxoData.vout,
                    value: utxoData.value,
                });
            }
            else {
                unConfirmedUtxos.push({
                    txid: utxoData.txid,
                    vout: utxoData.vout,
                    value: utxoData.value,
                });
            }
        });
        return [...confirmedUtxos, ...unConfirmedUtxos];
    }
    catch (err) {
        console.log('Get Utxos Error');
    }
});
exports.getUtxos = getUtxos;
const pushBTCpmt = (rawtx, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    const txid = yield postData(`https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}api/tx`, rawtx);
    return txid;
});
exports.pushBTCpmt = pushBTCpmt;
const postData = (url, json, content_type = "text/plain", apikey = "") => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = {};
        if (content_type)
            headers["Content-Type"] = content_type;
        if (apikey)
            headers["X-Api-Key"] = apikey;
        const res = yield axios_1.default.post(url, json, {
            headers,
        });
        return res.data;
    }
    catch (err) {
        console.log('Push Transaction Error');
        console.log(err.response.data);
    }
});
const getPrice = (networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}api/v1/prices`;
        const res = yield axios_1.default.get(url);
        return res.data;
    }
    catch (error) {
        console.log("Get Price Error!");
    }
});
exports.getPrice = getPrice;
const getBlockHeight = (networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}/api/blocks/tip/height`;
        const res = yield axios_1.default.get(url);
        return res.data;
    }
    catch (error) {
        console.log("Get Price Error!");
    }
});
exports.getBlockHeight = getBlockHeight;
const getFeeRate = (networkType, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const height = yield (0, exports.getBlockHeight)(networkType);
        const url = `https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}api/v1/blocks/${height}`;
        const blockData = yield axios_1.default.get(url);
        const feeRateData = blockData.data.map((item) => {
            return { timestamp: item.timestamp, avgFeeRate: item.extras.avgFeeRate };
        });
        return response.status(200).send({ feeRateData });
    }
    catch (error) {
        return response.status(400).send({
            type: 1,
            data: 'Get Fee Rate Error!'
        });
    }
});
exports.getFeeRate = getFeeRate;
const getRecommendedFeeRate = (networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://mempool.space/${networkType == network_config_1.TESTNET ? 'testnet/' : ''}api/v1/fees/recommended`;
        const response = yield axios_1.default.get(url);
        const recommendFeeRate = response.data;
        return recommendFeeRate;
    }
    catch (error) {
        console.log('Get Recommend Fee Rate Error!');
    }
});
exports.getRecommendedFeeRate = getRecommendedFeeRate;
