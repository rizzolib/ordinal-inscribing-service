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
exports.DelegateInscribeController = exports.FileInscribeController = exports.TextInscribeController = void 0;
const fileTapScript_1 = require("../services/tapscript/fileTapScript");
const textTapScript_1 = require("../services/tapscript/textTapScript");
const inscriptionPsbt_1 = require("../services/psbt/inscriptionPsbt");
const network_config_1 = require("../config/network.config");
const delegateTapScript_1 = require("../services/tapscript/delegateTapScript");
const network_config_2 = __importDefault(require("../config/network.config"));
const mempool_1 = require("../utils/mempool");
const mutex_1 = require("../utils/mutex");
const utxo_split_1 = require("../services/utxo/utxo.split");
const TapLeafPsbt_1 = __importDefault(require("../services/psbt/TapLeafPsbt"));
const TextInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, textTapScript_1.textTapScript)(inscriptionData);
        const sentUtxo = {
            txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
            vout: 0,
            value: 1000000
        };
        const contentType = network_config_1.TEXT_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.contents.length * inscriptionData.padding;
        const tapleafTxData = yield (0, TapLeafPsbt_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_2.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        };
        console.log('Sent Utxo for inscribing => ', sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_2.default.networkType);
        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId);
        const response = yield (0, utxo_split_1.splitUTXO)();
        console.log(response);
        return res.status(200).send({
            tx: realInscriptiontxId
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.TextInscribeController = TextInscribeController;
const FileInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, fileTapScript_1.fileTapScript)(inscriptionData);
        const sentUtxo = {
            txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
            vout: 0,
            value: 1000000
        };
        const contentType = network_config_1.FILE_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.files.length * inscriptionData.padding;
        const tapleafTxData = yield (0, TapLeafPsbt_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_2.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        };
        console.log('Sent Utxo for inscribing => ', sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_2.default.networkType);
        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId);
        const response = yield (0, utxo_split_1.splitUTXO)();
        console.log(response);
        return res.status(200).send({
            tx: realInscriptiontxId
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.FileInscribeController = FileInscribeController;
const DelegateInscribeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tapScript = yield (0, delegateTapScript_1.delegateTapScript)(inscriptionData);
        const sentUtxo = {
            txid: '7402984dae838f6700b561f425aacac82b91bc5924fb853631af65f0431cc76a',
            vout: 0,
            value: 1000000
        };
        const contentType = network_config_1.DELEGATE_CONTENT;
        const inscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sentUtxo);
        const sendUTXOSize = inscriptionTxData.virtualSize() * inscriptionData.feeRate + inscriptionData.delegateIds.length * inscriptionData.padding;
        const tapleafTxData = yield (0, TapLeafPsbt_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const txid = yield (0, mempool_1.pushBTCpmt)(tapleafTxData.toHex(), network_config_2.default.networkType);
        const sendingUtxo = {
            txid: txid,
            vout: 0,
            value: sendUTXOSize
        };
        console.log('Sent Utxo for inscribing => ', sendingUtxo);
        const realInscriptionTxData = yield (0, inscriptionPsbt_1.inscriptionPsbt)(contentType, inscriptionData, tapScript, sendingUtxo);
        const realInscriptiontxId = yield (0, mempool_1.pushBTCpmt)(realInscriptionTxData.toHex(), network_config_2.default.networkType);
        console.log('Successfully Inscribed Tx Id => ', realInscriptiontxId);
        const response = yield (0, utxo_split_1.splitUTXO)();
        console.log(response);
        return res.status(200).send({
            tx: realInscriptiontxId
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.DelegateInscribeController = DelegateInscribeController;
