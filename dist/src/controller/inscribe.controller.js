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
exports.tapRootInscribe = exports.signAndSend = exports.broadcast = exports.calculateTransactionFee = exports.inscribe = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const ecc = __importStar(require("tiny-secp256k1"));
const axios_1 = __importDefault(require("axios"));
const utxo_send_controller_1 = require("./utxo.send.controller");
const network_config_1 = __importDefault(require("../config/network.config"));
const SeedWallet_1 = require("../utils/wallet/SeedWallet");
const WIFWallet_1 = require("../utils/wallet/WIFWallet");
const mempool_1 = require("../utils/mempool");
const tapscript_1 = require("@cmdcode/tapscript");
const buff_utils_1 = require("@cmdcode/buff-utils");
const mempool_2 = require("../utils/mempool");
(0, bitcoinjs_lib_1.initEccLib)(ecc);
const networkType = network_config_1.default.networkType;
let wallet;
const network = network_config_1.default.networkType == "testnet" ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
if (network_config_1.default.walletType == 'WIF') {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new WIFWallet_1.WIFWallet({ networkType: networkType, privateKey: privateKey });
}
else if (network_config_1.default.walletType == 'WIF') {
    const seed = process.env.MNEMONIC;
    const wallet = new SeedWallet_1.SeedWallet({ networkType: networkType, seed: seed });
}
const keyPair = wallet.ecPair;
const inscribe = (type, mimetype, receiveAddress, content, feeRate) => __awaiter(void 0, void 0, void 0, function* () {
    let bufferContent;
    if (type == 'text') {
        bufferContent = Buffer.from(content);
    }
    else {
        bufferContent = content;
    }
    ;
    const ordinalStacks = [
        keyPair.publicKey.subarray(1, 33),
        bitcoinjs_lib_1.opcodes.OP_CHECKSIG,
        bitcoinjs_lib_1.opcodes.OP_FALSE,
        bitcoinjs_lib_1.opcodes.OP_IF,
        Buffer.from("ord"),
        bitcoinjs_lib_1.opcodes.OP_1,
        Buffer.from(mimetype),
        bitcoinjs_lib_1.opcodes.OP_0,
        bufferContent,
        bitcoinjs_lib_1.opcodes.OP_ENDIF,
    ];
    const ordinalScript = bitcoinjs_lib_1.script.compile(ordinalStacks);
    const scriptTree = {
        output: ordinalScript,
    };
    const script_p2tr = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: toXOnly(keyPair.publicKey),
        scriptTree,
        network,
    });
    const ordinlas_redeem = {
        output: ordinalScript,
        redeemVersion: 192,
    };
    const ordinals_p2tr = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: toXOnly(keyPair.publicKey),
        scriptTree,
        redeem: ordinlas_redeem,
        network,
    });
    const redeemPsbt = new bitcoinjs_lib_1.Psbt({ network });
    redeemPsbt.addInput({
        hash: 'e2aa2f0e1b49567e3c5e2f5985898657930e9f3ec1580b38429499e318c62b64',
        index: 0,
        witnessUtxo: { value: Math.pow(10, 6), script: script_p2tr.output },
        tapLeafScript: [
            {
                leafVersion: ordinlas_redeem.redeemVersion,
                script: ordinlas_redeem.output,
                controlBlock: ordinals_p2tr.witness[ordinals_p2tr.witness.length - 1],
            },
        ],
    });
    redeemPsbt.addOutput({
        address: receiveAddress,
        value: 546,
    });
    redeemPsbt.setMaximumFeeRate(100000);
    const redeemFee = calculateTransactionFee(keyPair, redeemPsbt, feeRate);
    if (type == 'text') {
        bufferContent = buff_utils_1.Buff.encode(content);
    }
    else {
        bufferContent = content;
    }
    ;
    const txid = yield (0, exports.tapRootInscribe)(buff_utils_1.Buff.encode(mimetype), receiveAddress, bufferContent, feeRate, redeemFee + 546);
    return txid;
});
exports.inscribe = inscribe;
const blockstream = new axios_1.default.Axios({
    baseURL: `https://mempool.space/testnet/api`,
});
function calculateTransactionFee(keyPair, psbt, feeRate) {
    psbt.signInput(0, keyPair);
    psbt.finalizeAllInputs();
    return psbt.extractTransaction().virtualSize() * feeRate;
}
exports.calculateTransactionFee = calculateTransactionFee;
function broadcast(txHex) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield blockstream.post("/tx", txHex);
        return response.data;
    });
}
exports.broadcast = broadcast;
function toXOnly(pubkey) {
    return pubkey.subarray(1, 33);
}
function signAndSend(keyPair, psbt) {
    return __awaiter(this, void 0, void 0, function* () {
        psbt.signInput(0, keyPair);
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
        const txid = yield broadcast(tx.toHex());
        console.log(`Success! Txid is ${txid}`);
        return txid;
    });
}
exports.signAndSend = signAndSend;
const tapRootInscribe = (mimetype, receiveAddress, content, feeRate, fee) => __awaiter(void 0, void 0, void 0, function* () {
    const script = [
        wallet.pubkey,
        "OP_CHECKSIG",
        "OP_0",
        "OP_IF",
        buff_utils_1.Buff.encode("ord"),
        "01",
        mimetype,
        "OP_0",
        content,
        "OP_ENDIF",
    ];
    const tapleaf = tapscript_1.Tap.encodeScript(script);
    const [tpubkey, cblock] = tapscript_1.Tap.getPubKey(wallet.pubkey, {
        target: tapleaf,
    });
    const address = tapscript_1.Address.p2tr.fromPubKey(tpubkey, "testnet");
    const txId = yield (0, utxo_send_controller_1.sendUTXO)(address, feeRate, fee);
    console.log(`Sent_UTXO_TxId=======> ${txId}`);
    const utxos = yield (0, mempool_1.getUtxos)(address, networkType);
    const sentUtxo = utxos.filter((item) => item.value == fee)[0];
    const txdata = tapscript_1.Tx.create({
        vin: [
            {
                txid: sentUtxo.txid,
                vout: sentUtxo.vout,
                prevout: {
                    value: sentUtxo.value,
                    scriptPubKey: ["OP_1", tpubkey],
                },
            },
        ],
        vout: [
            {
                value: 546,
                scriptPubKey: tapscript_1.Address.toScriptPubKey(receiveAddress),
            },
        ],
    });
    const sig = tapscript_1.Signer.taproot.sign(wallet.seckey, txdata, 0, {
        extension: tapleaf,
    });
    txdata.vin[0].witness = [sig, script, cblock];
    const rawTx = tapscript_1.Tx.encode(txdata).hex;
    const tx = yield (0, mempool_2.pushBTCpmt)(rawTx, networkType);
    return tx;
});
exports.tapRootInscribe = tapRootInscribe;
