import {
  script,
  Psbt,
  initEccLib,
  networks,
  Signer as BTCSigner,
  opcodes,
  payments,
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import * as ecc from "tiny-secp256k1";
import axios, { AxiosResponse } from "axios";
import { sendUTXOEstimateFee } from "./utxo.send.controller";
import networkConfig from "../config/network.config";
import { SeedWallet } from "../utils/wallet/SeedWallet";
import { WIFWallet } from '../utils/wallet/WIFWallet';
import { getUtxos } from "../utils/mempool";

import { type PublicKey, type SecretKey } from "@cmdcode/crypto-utils";
import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript";
import { Buff } from "@cmdcode/buff-utils";
import { pushBTCpmt } from "../utils/mempool";

initEccLib(ecc as any);

const networkType: string = networkConfig.networkType;
let wallet: any;

const network = networkConfig.networkType == "testnet" ? networks.testnet : networks.bitcoin;

if (networkConfig.walletType == 'WIF') {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == 'SEED') {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

const keyPair = wallet.ecPair;

export const feeEstimate = async (type: string, mimetype: string, content: any, feeRate: number, padding: number, receiveAddress: string): Promise<any> => {
  let bufferContent: any;
  if (type == 'text') {
    bufferContent = Buffer.from(content)
  } else {
    bufferContent = content;
  };
  const ordinalStacks = [
    keyPair.publicKey.subarray(1, 33),
    opcodes.OP_CHECKSIG,
    opcodes.OP_FALSE,
    opcodes.OP_IF,
    Buffer.from("ord"),
    opcodes.OP_1,
    Buffer.from(mimetype),
    opcodes.OP_0,
    bufferContent,
    opcodes.OP_ENDIF,
  ];
  const ordinalScript = script.compile(ordinalStacks);

  const scriptTree: Taptree = {
    output: ordinalScript,
  };

  const script_p2tr = payments.p2tr({
    internalPubkey: toXOnly(keyPair.publicKey),
    scriptTree,
    network,
  });

  const ordinlas_redeem = {
    output: ordinalScript,
    redeemVersion: 192,
  };

  const ordinals_p2tr = payments.p2tr({
    internalPubkey: toXOnly(keyPair.publicKey),
    scriptTree,
    redeem: ordinlas_redeem,
    network,
  });

  const redeemPsbt = new Psbt({ network });

  redeemPsbt.addInput({
    hash: 'e2aa2f0e1b49567e3c5e2f5985898657930e9f3ec1580b38429499e318c62b64',
    index: 0,
    witnessUtxo: { value: 10 ** 6, script: script_p2tr.output! },
    tapLeafScript: [
      {
        leafVersion: ordinlas_redeem.redeemVersion,
        script: ordinlas_redeem.output,
        controlBlock: ordinals_p2tr.witness![ordinals_p2tr.witness!.length - 1],
      },
    ],
  });

  redeemPsbt.addOutput({
    address: receiveAddress,
    value: padding,
  });

  redeemPsbt.setMaximumFeeRate(100000);
  const redeemFee = calculateTransactionFee(keyPair, redeemPsbt, feeRate);

  const sentUTXOFee = await sendUTXOEstimateFee(feeRate, redeemFee + padding);

  return sentUTXOFee + redeemFee + padding;
}

const blockstream = new axios.Axios({
  baseURL: `https://mempool.space/testnet/api`,
});

export function calculateTransactionFee(
  keyPair: BTCSigner,
  psbt: Psbt,
  feeRate: number
): number {
  psbt.signInput(0, keyPair);
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().virtualSize() * feeRate;
}

export async function broadcast(txHex: string) {
  const response: AxiosResponse<string> = await blockstream.post("/tx", txHex);
  return response.data;
}

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}

interface IUTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export async function signAndSend(
  keyPair: BTCSigner,
  psbt: Psbt
): Promise<string> {
  psbt.signInput(0, keyPair);
  psbt.finalizeAllInputs();

  const tx = psbt.extractTransaction();
  console.log(`Broadcasting Transaction Hex: ${tx.toHex()}`);
  const txid = await broadcast(tx.toHex());
  console.log(`Success! Txid is ${txid}`);

  return txid;
}
