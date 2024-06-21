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
exports.inscriptionPsbt = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const buffer_1 = require("../../utils/buffer");
const network_config_1 = __importStar(require("../../config/network.config"));
const initializeWallet_1 = __importDefault(require("../wallet/initializeWallet"));
const unisat_api_1 = require("../../utils/unisat.api");
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = require("ecpair");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const ECPair = (0, ecpair_1.ECPairFactory)(ecc);
const inscriptionPsbt = (contentType, inscriptionData, tapScript, sentUtxo) => __awaiter(void 0, void 0, void 0, function* () {
    const network = network_config_1.default.networkType == network_config_1.TESTNET ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
    const keyPair = initializeWallet_1.default.ecPair;
    const ordinal_script = bitcoinjs_lib_1.script.compile(tapScript);
    const scriptTree = {
        output: ordinal_script,
    };
    const redeem = {
        output: ordinal_script,
        redeemVersion: 192,
    };
    const ordinal_p2tr = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: (0, buffer_1.toXOnly)(keyPair.publicKey),
        network,
        scriptTree,
        redeem,
    });
    const psbt = new bitcoinjs_lib_1.Psbt({ network });
    if (inscriptionData.parentId) {
        let parentInscriptionUTXO = yield (0, unisat_api_1.getInscriptionInfo)(inscriptionData.parentId, network_config_1.default.networkType);
        psbt.addInput({
            hash: parentInscriptionUTXO.txid,
            index: parentInscriptionUTXO.vout,
            witnessUtxo: {
                value: parentInscriptionUTXO.value,
                script: initializeWallet_1.default.output,
            },
            tapInternalKey: (0, buffer_1.toXOnly)(keyPair.publicKey),
        });
    }
    psbt.addInput({
        hash: sentUtxo.txid,
        index: sentUtxo.vout,
        tapInternalKey: (0, buffer_1.toXOnly)(keyPair.publicKey),
        witnessUtxo: { value: sentUtxo.value, script: ordinal_p2tr.output },
        tapLeafScript: [
            {
                leafVersion: redeem.redeemVersion,
                script: redeem.output,
                controlBlock: ordinal_p2tr.witness[ordinal_p2tr.witness.length - 1],
            },
        ],
    });
    if (inscriptionData.parentId) {
        psbt.addOutput({
            address: inscriptionData.ordinalsAddress,
            value: inscriptionData.padding,
        });
    }
    if (contentType == network_config_1.TEXT_CONTENT) {
        inscriptionData.contents.forEach((content) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding,
            });
        });
    }
    else if (contentType == network_config_1.FILE_CONTENT) {
        inscriptionData.files.forEach((content) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding,
            });
        });
    }
    else if (contentType == network_config_1.DELEGATE_CONTENT) {
        inscriptionData.delegateIds.forEach((content) => {
            psbt.addOutput({
                address: inscriptionData.receiveAddress,
                value: inscriptionData.padding,
            });
        });
    }
    //Sign psbt
    if (inscriptionData.parentId) {
        const signer = tweakSigner(keyPair, { network });
        psbt.signInput(0, signer);
        psbt.signInput(1, keyPair);
    }
    else {
        psbt.signInput(0, keyPair);
    }
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction(true);
    return tx;
});
exports.inscriptionPsbt = inscriptionPsbt;
function tweakSigner(signer, opts = {}) {
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }
    const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash((0, buffer_1.toXOnly)(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }
    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
function tapTweakHash(pubKey, h) {
    return bitcoinjs_lib_1.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
