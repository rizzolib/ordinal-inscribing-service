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
exports.DelegateEstimateFeeController = exports.FileEstimateFeeController = exports.TextEstimateFeeController = void 0;
const fileTapScript_1 = require("../services/tapscript/fileTapScript");
const textTapScript_1 = require("../services/tapscript/textTapScript");
const inscriptionPsbt_1 = require("../services/psbt/inscriptionPsbt");
const network_config_1 = require("../config/network.config");
const TapLeafPsbtCreate_1 = __importDefault(require("../services/psbt/TapLeafPsbtCreate"));
const math_1 = require("../utils/math");
const delegateTapScript_1 = require("../services/tapscript/delegateTapScript");
const mutex_1 = require("../utils/mutex");
const TextEstimateFeeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.contents.length,
            fee: totalFee,
            serviceFee: (0, math_1.toInteger)(totalFee / 50),
            feeBySize: (0, math_1.toInteger)(totalFee / 20)
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.TextEstimateFeeController = TextEstimateFeeController;
const FileEstimateFeeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.files.length,
            fee: totalFee,
            serviceFee: (0, math_1.toInteger)(totalFee / 50),
            feeBySize: (0, math_1.toInteger)(totalFee / 20)
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.FileEstimateFeeController = FileEstimateFeeController;
const DelegateEstimateFeeController = (inscriptionData, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tapleafTxData = yield (0, TapLeafPsbtCreate_1.default)(contentType, inscriptionData, tapScript, sendUTXOSize);
        const totalFee = tapleafTxData.virtualSize() * inscriptionData.feeRate + sendUTXOSize;
        return res.status(200).send({
            satsInItem: inscriptionData.padding * inscriptionData.delegateIds.length,
            fee: totalFee,
            serviceFee: (0, math_1.toInteger)(totalFee / 50),
            feeBySize: (0, math_1.toInteger)(totalFee / 20)
        });
    }
    catch (error) {
        yield (0, mutex_1.setUtxoFlag)(0);
        console.log(error);
        return res.status(400).send({ error });
    }
});
exports.DelegateEstimateFeeController = DelegateEstimateFeeController;
