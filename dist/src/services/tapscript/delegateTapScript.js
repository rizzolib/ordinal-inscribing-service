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
exports.delegateTapScript = void 0;
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const unisat_api_1 = require("../../utils/unisat.api");
const network_config_1 = __importDefault(require("../../config/network.config"));
const cbor_1 = __importDefault(require("cbor"));
const buffer_1 = require("../../utils/buffer");
const keyPair = initializeWallet_1.default.ecPair;
const delegateTapScript = (inscriptionData) => __awaiter(void 0, void 0, void 0, function* () {
    let tapScript = [(0, buffer_1.toXOnly)(keyPair.publicKey), bitcoinjs_lib_1.opcodes.OP_CHECKSIG];
    let pointers = [];
    inscriptionData.delegateIds.forEach((item, index) => {
        pointers.push(index * inscriptionData.padding);
    });
    if (inscriptionData.parentId) {
        let parentInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(inscriptionData.parentId, network_config_1.default.networkType);
        pointers = pointers.map((pointer, index) => {
            return pointer + parentInscriptionUTXO.value;
        });
    }
    let pointerBuffer = [];
    pointerBuffer = pointers.map((pointer, index) => {
        return Buffer.from(pointer.toString(16).padStart(4, "0"), "hex").reverse();
    });
    const parts = inscriptionData.parentId.split("i");
    const parentInscriptionTransactionID = parts[0];
    const inscriptionTransactionBuffer = Buffer.from(parentInscriptionTransactionID, "hex").reverse();
    let parentInscriptionBuffer;
    const index = parts[1];
    if (parseInt(index, 10) != 0) {
        const indexBuffer = Buffer.from(parseInt(index, 10).toString(16).padStart(2, "0"), "hex").reverse();
        parentInscriptionBuffer = Buffer.concat([
            inscriptionTransactionBuffer,
            indexBuffer,
        ]);
    }
    else {
        parentInscriptionBuffer = inscriptionTransactionBuffer;
    }
    const DelegateIDparts = inscriptionData.delegateIds[0].split("i");
    const delegateInscriptionTransactionID = DelegateIDparts[0];
    const DelegateinscriptionTransactionBuffer = Buffer.from(delegateInscriptionTransactionID, "hex").reverse();
    let DelegateInscriptionBuffer;
    const DelegateIndex = DelegateIDparts[1];
    if (parseInt(DelegateIndex, 10) != 0) {
        const DelegateIndexBuffer = Buffer.from(parseInt(DelegateIndex, 10).toString(16).padStart(2, "0"), "hex").reverse();
        DelegateInscriptionBuffer = Buffer.concat([
            DelegateinscriptionTransactionBuffer,
            DelegateIndexBuffer,
        ]);
    }
    else {
        DelegateInscriptionBuffer = DelegateinscriptionTransactionBuffer;
    }
    for (let i = 0; i < inscriptionData.delegateIds.length; i++) {
        let subScript = [];
        subScript.push(bitcoinjs_lib_1.opcodes.OP_FALSE, bitcoinjs_lib_1.opcodes.OP_IF, Buffer.from("ord", "utf8"));
        subScript.push(1, 2, pointerBuffer[i]);
        subScript.push(1, 3, parentInscriptionBuffer);
        if (inscriptionData.metadata) {
            subScript.push(1, 5, cbor_1.default.encode(JSON.parse(inscriptionData.metadata)));
        }
        if (inscriptionData.metaprotocol) {
            subScript.push(1, 7, Buffer.from(inscriptionData.metaprotocol, "utf8"));
        }
        subScript.push(1, 11, DelegateInscriptionBuffer);
        subScript.push(bitcoinjs_lib_1.opcodes.OP_ENDIF);
        tapScript.push(...subScript);
    }
    return tapScript;
});
exports.delegateTapScript = delegateTapScript;
