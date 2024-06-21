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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUnisatAPI = exports.getBtcUtxoInfo = exports.isContainOrdinal = exports.getInscriptionInfo = exports.delay = void 0;
const axios_1 = __importDefault(require("axios"));
const network_config_1 = require("../config/network.config");
const dotenv_1 = __importDefault(require("dotenv"));
const mutex_1 = require("./mutex");
const __1 = require("../..");
dotenv_1.default.config();
const apiArray = JSON.parse((_a = process.env.OPENAPI_UNISAT_TOKEN) !== null && _a !== void 0 ? _a : "");
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
const getInscriptionInfo = (inscriptionid, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mutex_1.waitUtxoFlag)();
        yield (0, mutex_1.setUtxoFlag)(1);
        if (__1.app.locals.iterator >= apiArray.length) {
            yield (0, mutex_1.setApiIterator)(0);
        }
        const url = `https://open-api${networkType == network_config_1.TESTNET ? "-testnet" : ""}.unisat.io/v1/indexer/inscription/info/${inscriptionid}`;
        const config = {
            headers: {
                Authorization: `Bearer ${apiArray[__1.app.locals.iterator]}`,
            },
        };
        let res = yield axios_1.default.get(url, config);
        let iterator = __1.app.locals.iterator + 1;
        yield (0, mutex_1.setApiIterator)(iterator);
        yield (0, mutex_1.setUtxoFlag)(0);
        const inscriptionInfo = res.data;
        const info = {
            txid: inscriptionInfo.data.utxo.txid,
            vout: inscriptionInfo.data.utxo.vout,
            value: inscriptionInfo.data.utxo.satoshi,
        };
        return info;
    }
    catch (err) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log("Get Inscription Utxo Error");
    }
});
exports.getInscriptionInfo = getInscriptionInfo;
const isContainOrdinal = (inscriptionid, address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mutex_1.waitUtxoFlag)();
        yield (0, mutex_1.setUtxoFlag)(1);
        if (__1.app.locals.iterator >= apiArray.length) {
            yield (0, mutex_1.setApiIterator)(0);
        }
        const url = `https://open-api${networkType == network_config_1.TESTNET ? "-testnet" : ""}.unisat.io/v1/indexer/inscription/info/${inscriptionid}`;
        const config = {
            headers: {
                Authorization: `Bearer ${apiArray[__1.app.locals.iterator]}`,
            },
        };
        const res = yield axios_1.default.get(url, config);
        let iterator = __1.app.locals.iterator + 1;
        yield (0, mutex_1.setApiIterator)(iterator);
        yield (0, mutex_1.setUtxoFlag)(0);
        const inscriptionInfo = res.data;
        if (address == inscriptionInfo.data.utxo.address) {
            return true;
        }
        return false;
    }
    catch (err) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log("Get Inscription Utxo Error");
    }
});
exports.isContainOrdinal = isContainOrdinal;
// Get BTC UTXO
const getBtcUtxoInfo = (address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mutex_1.waitUtxoFlag)();
    yield (0, mutex_1.setUtxoFlag)(1);
    if (__1.app.locals.iterator >= apiArray.length) {
        yield (0, mutex_1.setApiIterator)(0);
    }
    const url = `https://open-api${networkType == network_config_1.TESTNET ? "-testnet" : ""}.unisat.io/v1/indexer/address/${address}/utxo-data`;
    const config = {
        headers: {
            Authorization: `Bearer ${apiArray[__1.app.locals.iterator]}`,
        },
    };
    let iterator = __1.app.locals.iterator + 1;
    yield (0, mutex_1.setApiIterator)(iterator);
    let cursor = 0;
    const size = 5000;
    let utxos = [];
    while (1) {
        const res = yield axios_1.default.get(url, Object.assign(Object.assign({}, config), { params: { cursor, size } }));
        if (res.data.code === -1)
            throw "Invalid Address";
        let fetchUtxos = res.data.data.utxo.reverse();
        utxos.push(...fetchUtxos.map((utxo) => {
            return {
                txid: utxo.txid,
                value: utxo.satoshi,
                vout: utxo.vout,
            };
        }));
        cursor += fetchUtxos.length;
        if (cursor >= res.data.data.total - res.data.data.totalRunes)
            break;
    }
    yield (0, mutex_1.setUtxoFlag)(0);
    return utxos;
});
exports.getBtcUtxoInfo = getBtcUtxoInfo;
const testUnisatAPI = (address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mutex_1.waitUtxoFlag)();
    yield (0, mutex_1.setUtxoFlag)(1);
    if (__1.app.locals.iterator >= apiArray.length) {
        yield (0, mutex_1.setApiIterator)(0);
    }
    const url = `https://open-api${networkType == network_config_1.TESTNET ? "-testnet" : ""}.unisat.io/v1/indexer/address/${address}/utxo-data`;
    const config = {
        headers: {
            Authorization: `Bearer ${apiArray[__1.app.locals.iterator]}`,
        },
    };
    let iterator = __1.app.locals.iterator + 1;
    yield (0, mutex_1.setApiIterator)(iterator);
    let cursor = 0;
    const size = 5000;
    let utxos = [];
    while (1) {
        const res = yield axios_1.default.get(url, Object.assign(Object.assign({}, config), { params: { cursor, size } }));
        if (res.data.code === -1)
            throw "Invalid Address";
        let fetchUtxos = res.data.data.utxo.reverse();
        utxos.push(...fetchUtxos.map((utxo) => {
            return {
                txid: utxo.txid,
                value: utxo.satoshi,
                vout: utxo.vout,
            };
        }));
        cursor += fetchUtxos.length;
        if (cursor >= res.data.data.total - res.data.data.totalRunes)
            break;
    }
    yield (0, mutex_1.setUtxoFlag)(0);
    return utxos;
});
exports.testUnisatAPI = testUnisatAPI;
