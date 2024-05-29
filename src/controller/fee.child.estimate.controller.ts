import {
  script,
  Psbt,
  initEccLib,
  networks,
  Signer as BTCSigner,
  opcodes,
  crypto,
  payments,
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import * as ecc from "tiny-secp256k1";
import networkConfig from "../config/network.config";
import { SeedWallet } from "../services/wallet/SeedWallet";
import { WIFWallet } from '../services/wallet/WIFWallet';
import { getUtxos } from "../utils/mempool";
import { ECPairFactory, ECPairAPI } from "ecpair";
import { WIF, SEED, TESTNET } from "../config/network.config";
import { MAXIMUMFEERATE } from "../config/network.config";
import { splitBuffer } from "../utils/buffer";
import { getInscriptionInfo } from "../utils/unisat.api";
import cbor from 'cbor';
import { SEND_UTXO_FEE_LIMIT } from "../config/network.config";
import { getSendBTCUTXOArray } from "../services/utxo/utxo.management";
import { redeemSingleSendUTXOPsbt } from "../services/utxo/utxo.reinscribe.singleSendPsbt";

initEccLib(ecc as any);
const ECPair: ECPairAPI = ECPairFactory(ecc);

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

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

export const FeechildInscribe = async (type: string, mimetype: string, content: any, feeRate: number, padding: number, metadata: string, metaprotocol: string): Promise<any> => {
  let bufferContent: any;
  if (type == 'text') {
    bufferContent = Buffer.from(content)
  } else {
    bufferContent = content;
  };
  const splitedBuffer = splitBuffer(bufferContent, 400);
  const parentId = 'f93d8fee42222724a7a211f495b6e3df5b45b7374ec0c9c2b97c5637b52209aai0';
  const receiveAddress = 'tb1ppx220ln489s5wqu8mqgezm7twwpj0avcvle3vclpdkpqvdg3mwqsvydajn';

  //get Inscription UTXO Info
  const inscriptionUtxoInfo = await getInscriptionInfo(parentId, networkConfig.networkType);
  const txidBuffer = Buffer.from(parentId, 'hex');
  const inscriptionBuffer = txidBuffer.reverse();
  const metadataJson = {
    'content': metadata
  }
  const metadataBuffer = cbor.encode(metadataJson);
  const pointer = inscriptionUtxoInfo.value;
  const pointerBuffer: Buffer = Buffer.from(pointer.toString(16).padStart(4, '0'), 'hex').reverse();

  //TapScript array for child inscription
  let childOrdinalStacks: any = [
    toXOnly(keyPair.publicKey),
    opcodes.OP_CHECKSIG,
    opcodes.OP_FALSE,
    opcodes.OP_IF,
    Buffer.from("ord", "utf8"),
    1,
    1,
    Buffer.from(mimetype, "utf8"),
    1,
    2,
    pointerBuffer,
    1,
    3,
    inscriptionBuffer,
    1,
    5,
    metadataBuffer,
    1,
    7,
    Buffer.from(metaprotocol, "utf8"),
    opcodes.OP_0
  ];
  splitedBuffer.forEach((item: Buffer) => {
    childOrdinalStacks.push(item)
  })
  childOrdinalStacks.push(opcodes.OP_ENDIF)

  const ordinalScript = script.compile(childOrdinalStacks);

  const scriptTree: Taptree = {
    output: ordinalScript,
  };

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
  //temporary psbt creating
  let redeemFee: number = await redeemPsbtCalculateFee(inscriptionUtxoInfo, ordinals_p2tr, ordinlas_redeem, feeRate, receiveAddress, padding);
  redeemFee += padding + inscriptionUtxoInfo.value

  const response = await sendUTXOEstimateFee(feeRate, redeemFee)
  if(response.isSuccess) {
    redeemFee += response.data as number;
    return {...response, data: redeemFee}
  } else {
    return response;
  }
}

export const sendUTXOEstimateFee = async (feeRate: number, amount: number) => {
  const utxos = await getUtxos(wallet.address, networkType);
  let response = getSendBTCUTXOArray(utxos, amount + SEND_UTXO_FEE_LIMIT);
  if (!response.isSuccess) {
    return { isSuccess: false, data: 'No enough balance on admin wallet.' };
  }
  let redeemPsbt: Psbt = redeemSingleSendUTXOPsbt(wallet, response.data, networkType, amount);
  redeemPsbt = wallet.signPsbt(redeemPsbt, wallet.ecPair)
  let redeemFee = redeemPsbt.extractTransaction().virtualSize() * feeRate;

  return { isSuccess: true, data: redeemFee };
}

function tweakSigner(signer: any, opts: any = {}) {
  let privateKey = signer.privateKey;
  if (!privateKey) {
    console.log('Private key is required for tweaking signer!')
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }
  const tweakedPrivateKey: any = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
  if (!tweakedPrivateKey) {
    console.log('Invalid tweaked private key!')
  }
  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}

const redeemPsbtCalculateFee = async (inscriptionUtxoInfo: IUtxo, ordinals_p2tr: any, ordinlas_redeem: any, feeRate: number, receiveAddress: string, padding: number): Promise<number> => {
  const redeemPsbt = new Psbt({ network });
  redeemPsbt.addInput({
    hash: inscriptionUtxoInfo.txid,
    index: inscriptionUtxoInfo.vout,
    witnessUtxo: {
      value: inscriptionUtxoInfo.value,
      script: wallet.output,
    },
    tapInternalKey: toXOnly(keyPair.publicKey),
  });
  redeemPsbt.addInput({
    hash: 'e2aa2f0e1b49567e3c5e2f5985898657930e9f3ec1580b38429499e318c62b64',
    index: 0,
    witnessUtxo: { value: 10 ** 6, script: ordinals_p2tr.output! },
    tapInternalKey: toXOnly(keyPair.publicKey),
    tapLeafScript: [
      {
        leafVersion: ordinlas_redeem.redeemVersion,
        script: ordinlas_redeem.output,
        controlBlock: ordinals_p2tr.witness![ordinals_p2tr.witness!.length - 1],
      },
    ],
  });

  redeemPsbt.addOutput({
    address: receiveAddress, //Destination Address
    value: inscriptionUtxoInfo.value,
  });

  redeemPsbt.addOutput({
    address: receiveAddress, //Destination Address
    value: padding,
  });

  redeemPsbt.setMaximumFeeRate(MAXIMUMFEERATE);
  const redeemFee = calculateTransactionFee(keyPair, redeemPsbt, feeRate);

  return redeemFee;

}

function calculateTransactionFee(
  keyPair: BTCSigner,
  psbt: Psbt,
  feeRate: number
): number {
  const signer = tweakSigner(keyPair, { network })
  psbt.signInput(0, signer);
  psbt.signInput(1, keyPair);
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().virtualSize() * feeRate;
}

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}
