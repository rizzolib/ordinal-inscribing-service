import {
  script,
  Psbt,
  initEccLib,
  networks,
  Signer as BTCSigner,
  opcodes,
  payments
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import * as ecc from "tiny-secp256k1";
import { multiSendUTXO } from "../services/utxo/utxo.multiSend";
import networkConfig from "../config/network.config";
import { SeedWallet } from "../services/wallet/SeedWallet";
import { WIFWallet } from '../services/wallet/WIFWallet';
import { type PublicKey, type SecretKey } from "@cmdcode/crypto-utils";
import { Address, Signer, Tap, Tx, TxTemplate } from "@cmdcode/tapscript";
import { Buff } from "@cmdcode/buff-utils";
import { pushBTCpmt } from "../utils/mempool";
import { WIF, SEED, TESTNET } from "../config/network.config";
import { MAXIMUMFEERATE } from "../config/network.config";
initEccLib(ecc as any);

const networkType: string = networkConfig.networkType;
let wallet: any;

const network = networkConfig.networkType == TESTNET ? networks.testnet : networks.bitcoin;

if (networkConfig.walletType == WIF) {
  const privateKey: string = process.env.PRIVATE_KEY as string;
  wallet = new WIFWallet({ networkType: networkType, privateKey: privateKey });
} else if (networkConfig.walletType == SEED) {
  const seed: string = process.env.MNEMONIC as string;
  wallet = new SeedWallet({ networkType: networkType, seed: seed });
}

const keyPair = wallet.ecPair;

export const inscribeBulkText = async (receiveAddress: string, contentArray: Array<string>, feeRate: number, padding: number): Promise<any> => {
  let mimetype = 'text/plain';
  const feeArray = contentArray.map((contentItem: string) => {
    let bufferContent: any = Buffer.from(contentItem)

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
    redeemPsbt.setMaximumFeeRate(MAXIMUMFEERATE);
    const redeemFee = calculateTransactionFee(keyPair, redeemPsbt, feeRate);
    return redeemFee + padding;
  });
  const response = await tapRootInscribeBulkText(Buff.encode(mimetype), receiveAddress, contentArray, feeRate, feeArray, padding);
  return response;
}
export const tapRootInscribeBulkText = async (mimetype: any, receiveAddress: string, contentArray: any, feeRate: number, feeArray: Array<number>, padding: number) => {
  let tpubkeyArray: Array<string> = [];
  let tapleafArray: Array<any> = [];
  let scriptArray: Array<any> = [];
  let cblockArray: Array<any> = [];

  const addressArray = contentArray.map((contentItem: string) => {
    const script = [
      wallet.pubkey,
      "OP_CHECKSIG",
      "OP_0",
      "OP_IF",
      Buff.encode("ord"),
      "01",
      mimetype,
      "OP_0",
      Buff.encode(contentItem),
      "OP_ENDIF",
    ];
    const tapleaf = Tap.encodeScript(script as any[]);
    const [tpubkey, cblock] = Tap.getPubKey(wallet.pubkey as PublicKey, {
      target: tapleaf,
    });

    tpubkeyArray.push(tpubkey);
    tapleafArray.push(tapleaf);
    scriptArray.push(script);
    cblockArray.push(cblock);

    const address = Address.p2tr.fromPubKey(tpubkey, networkConfig.networkType == TESTNET ? TESTNET : "main");

    return address;
  });

  const response = await multiSendUTXO(addressArray, feeRate, feeArray);

  if (response.isSuccess) {
    console.log(`Sent_UTXO_TxId => ${response.data}`)
  } else {
    return response;
  }

  const txdataArray = addressArray.map((address: string, index: number) => {
    const txdata = Tx.create({
      vin: [
        {
          txid: response.data as string,
          vout: index,
          prevout: {
            value: feeArray[index],
            scriptPubKey: ["OP_1", tpubkeyArray[index]],
          },
        },
      ],
      vout: [
        {
          value: padding,
          scriptPubKey: Address.toScriptPubKey(receiveAddress),
        },
      ],
    });
    return txdata;
  })

  let inscriptionTxArray: Array<any> = [];

  for (let i = 0; i < txdataArray.length; i++) {
    const sig = Signer.taproot.sign(wallet.seckey as SecretKey, txdataArray[i], 0, {
      extension: tapleafArray[i],
    });
    txdataArray[i].vin[0].witness = [sig, scriptArray[i] as any[], cblockArray[i]];

    const rawTx = Tx.encode(txdataArray[i]).hex;
    const tx = await pushBTCpmt(rawTx, networkType);

    inscriptionTxArray.push(tx);
  }

  return { isSuccess: true, data: inscriptionTxArray }
};

export function calculateTransactionFee(
  keyPair: BTCSigner,
  psbt: Psbt,
  feeRate: number
): number {
  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(0, keyPair);
  }
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().virtualSize() * feeRate;
}

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}