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
exports.getBtcUtxoInfo = exports.getInscriptionInfo = void 0;
const axios_1 = __importDefault(require("axios"));
const network_config_1 = require("../config/network.config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getInscriptionInfo = (inscriptionid, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://open-api${networkType == network_config_1.TESTNET ? '-testnet' : ''}.unisat.io/v1/indexer/inscription/info/${inscriptionid}`;
        const res = yield axios_1.default.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
            },
        });
        const inscriptionInfo = res.data;
        const info = {
            txid: inscriptionInfo.data.utxo.txid,
            vout: inscriptionInfo.data.utxo.vout,
            value: inscriptionInfo.data.utxo.satoshi
        };
        return info;
    }
    catch (err) {
        console.log('Get Utxos Error');
    }
});
exports.getInscriptionInfo = getInscriptionInfo;
const getBtcUtxoInfo = (address, networkType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://open-api${networkType == network_config_1.TESTNET ? '-testnet' : ''}.unisat.io/v1/indexer/address/${address}/utxo-data`;
        const res = yield axios_1.default.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
            },
        });
        const response = res.data;
        const utxoInfo = response.data.utxo.map((utxo, index) => {
            return {
                txid: utxo.txid,
                vout: utxo.vout,
                value: utxo.satoshi
            };
        });
        return utxoInfo;
    }
    catch (err) {
        console.log('Get Utxos Error');
    }
});
exports.getBtcUtxoInfo = getBtcUtxoInfo;
