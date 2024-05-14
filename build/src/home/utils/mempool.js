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
exports.pushBTCpmt = exports.getUtxos = exports.getScriptPubkey = void 0;
const axios_1 = __importDefault(require("axios"));
const getScriptPubkey = (tx, address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://mempool.space/${networkType}/api/tx/${tx}`;
    const res = yield axios_1.default.get(url);
    const output = res.data.vout.find((output) => output.scriptpubkey_address === address);
    return output.scriptpubkey;
});
exports.getScriptPubkey = getScriptPubkey;
const getUtxos = (address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://mempool.space/${networkType}/api/address/${address}/utxo`;
    const res = yield axios_1.default.get(url);
    const utxos = [];
    res.data.forEach((utxoData) => {
        utxos.push({
            txid: utxoData.txid,
            vout: utxoData.vout,
            value: utxoData.value,
        });
    });
    return utxos;
});
exports.getUtxos = getUtxos;
const pushBTCpmt = (rawtx, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    const txid = yield postData(`https://mempool.space/${networkType}/api/tx`, rawtx);
    return txid;
});
exports.pushBTCpmt = pushBTCpmt;
const postData = (url, json, content_type = "text/plain", apikey = "") => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    while (1) {
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
            const axiosErr = err;
            console.log("axiosErr.response?.data", (_a = axiosErr.response) === null || _a === void 0 ? void 0 : _a.data);
            if (!((_b = axiosErr.response) === null || _b === void 0 ? void 0 : _b.data).includes('sendrawtransaction RPC error: {"code":-26,"message":"too-long-mempool-chain,'))
                throw new Error("Got an err when push tx");
        }
    }
});
