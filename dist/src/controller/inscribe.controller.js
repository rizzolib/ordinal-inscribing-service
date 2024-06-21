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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendingOrdinalController = exports.DelegateInscribeController = exports.FileInscribeController = exports.TextInscribeController = void 0;
const fileTapScript_1 = require("../services/tapscript/fileTapScript");
const textTapScript_1 = require("../services/tapscript/textTapScript");
const inscriptionPsbt_1 = require("../services/psbt/inscriptionPsbt");
const network_config_1 = __importStar(require("../config/network.config"));
const delegateTapScript_1 = require("../services/tapscript/delegateTapScript");
const TapLeafPsbtCreate_1 = __importDefault(require("../services/psbt/TapLeafPsbtCreate"));
const sendOrdinalPsbt_1 = require("../services/psbt/sendOrdinalPsbt");
const mempool_1 = require("../utils/mempool");
const unisat_api_1 = require("../utils/unisat.api");
const TextInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, textTapScript_1.textTapScript)(inscriptionData);
        const sentUtxo = {
            txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
            vout: 0,
            value: 1000000,
        };
        const contentType = network_config_1.TEXT_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate +
            inscriptionData.contents.length * inscriptionData.padding;
        const userUtxo = {
            txid: inscriptionData.sendBtcTxId,
            vout: inscriptionData.txIndex,
            value: inscriptionData.btcAmount,
        };
        console.log("Starting Waiting 5s!");
        yield (0, unisat_api_1.delay)(5000);
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, userUtxo, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_1.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize,
        };
        console.log("Sent Utxo for inscribing => ", sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_1.default.networkType);
        console.log("Successfully Inscribed Tx Id => ", realInscriptiontxId);
        return res.status(200).send({
            tx: realInscriptiontxId,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.TextInscribeController = TextInscribeController;
const FileInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, fileTapScript_1.fileTapScript)(inscriptionData);
        const sentUtxo = {
            txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
            vout: 0,
            value: 1000000,
        };
        const contentType = network_config_1.FILE_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate +
            inscriptionData.files.length * inscriptionData.padding;
        const userUtxo = {
            txid: inscriptionData.sendBtcTxId,
            vout: inscriptionData.txIndex,
            value: +inscriptionData.btcAmount,
        };
        console.log("Starting Waiting 5s!");
        yield (0, unisat_api_1.delay)(5000);
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, userUtxo, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_1.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize,
        };
        console.log("here5");
        console.log("Sent Utxo for inscribing => ", sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_1.default.networkType);
        console.log("Successfully Inscribed Tx Id => ", realInscriptiontxId);
        return res.status(200).send({
            tx: realInscriptiontxId,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.FileInscribeController = FileInscribeController;
const DelegateInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, delegateTapScript_1.delegateTapScript)(inscriptionData);
        const sentUtxo = {
            txid: "7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a",
            vout: 0,
            value: 1000000,
        };
        const contentType = network_config_1.DELEGATE_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate +
            inscriptionData.delegateIds.length * inscriptionData.padding;
        const userUtxo = {
            txid: inscriptionData.sendBtcTxId,
            vout: inscriptionData.txIndex,
            value: inscriptionData.btcAmount,
        };
        console.log("Starting Waiting 5s!");
        yield (0, unisat_api_1.delay)(5000);
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, userUtxo, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_1.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize,
        };
        console.log("Sent Utxo for inscribing => ", sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_1.default.networkType);
        console.log("Successfully Inscribed Tx Id => ", realInscriptiontxId);
        return res.status(200).send({
            tx: realInscriptiontxId,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.DelegateInscribeController = DelegateInscribeController;
const SendingOrdinalController = (sendingOrdinalData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, sendOrdinalPsbt_1.sendOrdinalBTCPsbt)(sendingOrdinalData);
        if (!response.isSuccess) {
            return res.status(400).send({ data: response.data });
        }
        else {
            console.log(response.data.toHex());
            return res.status(200).send({ data: response.data.toHex() });
        }
    }
    catch (error) {
        return res.status(400).send({ error });
    }
});
exports.SendingOrdinalController = SendingOrdinalController;
