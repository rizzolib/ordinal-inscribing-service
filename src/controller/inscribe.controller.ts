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
import { sendUTXO } from "./utxo.send.controller";
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

export const inscribe = async (type: string, mimetype: string, receiveAddress: string, content: any, feeRate: number): Promise<string> => {
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
    value: 546,
  });
  redeemPsbt.setMaximumFeeRate(100000);
  const redeemFee = calculateTransactionFee(keyPair, redeemPsbt, feeRate);

  if (type == 'text') {
    bufferContent = Buff.encode(content)
  } else {
    bufferContent = content;
  };
  const txid: any = await tapRootInscribe(Buff.encode(mimetype), receiveAddress, bufferContent, feeRate, redeemFee + 546);

  return txid;
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


export const tapRootInscribe = async (mimetype: any, receiveAddress: string, content: any, feeRate: number, fee: number) => {

  const script = [
    wallet.pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    Buff.encode("ord"),
    "01",
    mimetype,
    "OP_0",
    content,
    "OP_ENDIF",
  ];
  const tapleaf = Tap.encodeScript(script as any[]);
  const [tpubkey, cblock] = Tap.getPubKey(wallet.pubkey as PublicKey, {
    target: tapleaf,
  });
  const address = Address.p2tr.fromPubKey(tpubkey, "testnet");

  const txId = await sendUTXO(address, feeRate, fee);
  console.log(`Sent_UTXO_TxId=======> ${txId}`)

  const utxos: any = await getUtxos(address, networkType);
  const sentUtxo = utxos.filter((item: { value: number; }) => item.value == fee)[0];

  const txdata = Tx.create({
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
        scriptPubKey: Address.toScriptPubKey(receiveAddress),
      },
    ],
  });

  const sig = Signer.taproot.sign(wallet.seckey as SecretKey, txdata, 0, {
    extension: tapleaf,
  });
  txdata.vin[0].witness = [sig, script as any[], cblock];

  const rawTx = Tx.encode(txdata).hex;
  const tx = await pushBTCpmt(rawTx, networkType);
  return tx;
};
