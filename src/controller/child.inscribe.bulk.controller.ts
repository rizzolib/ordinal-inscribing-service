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
import { singleSendUTXO } from "../services/utxo/utxo.singleSend";
import networkConfig from "../config/network.config";
import { SeedWallet } from "../services/wallet/SeedWallet";
import { WIFWallet } from '../services/wallet/WIFWallet';
import { getUtxos } from "../utils/mempool";
import { ECPairFactory, ECPairAPI } from "ecpair";
import { pushBTCpmt } from "../utils/mempool";
import { WIF, SEED, TESTNET } from "../config/network.config";
import { MAXIMUMFEERATE } from "../config/network.config";
import { splitBuffer } from "../utils/buffer";
import { getInscriptionInfo } from "../utils/unisat.api";
import cbor from 'cbor';

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

export const childInscribeBulkText = async (parentId: string, mimetype: string, receiveAddress: string, contents: Array<string>, feeRate: number, padding: number, metadata: string, metaprotocol: string): Promise<any> => {
  const contentsBufferArray = contents.map((content, index) => splitBuffer(Buffer.from(content, 'utf8'), 400))

  //get Inscription UTXO Info
  const inscriptionUtxoInfo = await getInscriptionInfo(parentId, networkConfig.networkType);
  const inscriptionIdBuffer = Buffer.from(parentId, 'hex');
  const inscriptionBuffer = inscriptionIdBuffer.reverse();
  const metadataJson = {
    'content': metadata
  }
  const metadataBuffer = cbor.encode(metadataJson);
  const pointer = inscriptionUtxoInfo.value;

  //TapScript array for child inscription
  let childOrdinalStacks: any = [
    toXOnly(keyPair.publicKey),
    opcodes.OP_CHECKSIG,
  ];
  contentsBufferArray.forEach((contentBuffer, index) => {
    let inscriptionItem = [
      opcodes.OP_FALSE,
      opcodes.OP_IF,
      Buffer.from("ord", "utf8"),
      1,
      1,
      Buffer.from(mimetype, "utf8"),
      1,
      2,
      Buffer.from((pointer + padding * index).toString(16).padStart(4, '0'), 'hex').reverse(),
      1,
      3,
      inscriptionBuffer,
      1,
      5,
      metadataBuffer,
      1,
      7,
      Buffer.from(metaprotocol, "utf8"),
    ];

    contentBuffer.forEach((item: Buffer) => {
      inscriptionItem.push(opcodes.OP_0)
      inscriptionItem.push(item)
    })

    inscriptionItem.push(opcodes.OP_ENDIF)
    childOrdinalStacks.push(...inscriptionItem)
  })

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
  let redeemFee: number = await redeemPsbtCalculateFee(contents.length, inscriptionUtxoInfo, ordinals_p2tr, ordinlas_redeem, feeRate, receiveAddress, padding);
  redeemFee += padding * contents.length + inscriptionUtxoInfo.value

  //real psbt creating
  const response = await BulkTextChilldInscribe(contents.length, inscriptionUtxoInfo, ordinals_p2tr, ordinlas_redeem, feeRate, receiveAddress, padding, redeemFee);
  return response;
}

const BulkTextChilldInscribe = async (contentsLength: number, inscriptionUtxoInfo: IUtxo, ordinals_p2tr: any, ordinlas_redeem: any, feeRate: number, receiveAddress: string, padding: number, fee: number) => {
  //tapscript address
  const address = ordinals_p2tr.address ?? "";

  //send utxo to taproot address
  const response = await singleSendUTXO(address, feeRate, fee);

  if (response.isSuccess) {
    console.log(`Sent_UTXO_TxId => ${response.data}`)
  } else {
    return response;
  }

  const utxos: any = await getUtxos(address, networkType);
  const sentUtxo = utxos.filter((item: { value: number; }) => item.value == fee)[0];

  const psbt = new Psbt({ network });
  psbt.addInput({
    hash: inscriptionUtxoInfo.txid,
    index: inscriptionUtxoInfo.vout,
    witnessUtxo: {
      value: inscriptionUtxoInfo.value,
      script: wallet.output,
    },
    tapInternalKey: toXOnly(keyPair.publicKey),
  });
  psbt.addInput({
    hash: sentUtxo.txid,
    index: sentUtxo.vout,
    witnessUtxo: { value: sentUtxo.value, script: ordinals_p2tr.output! },
    tapInternalKey: toXOnly(keyPair.publicKey),
    tapLeafScript: [
      {
        leafVersion: ordinlas_redeem.redeemVersion,
        script: ordinlas_redeem.output,
        controlBlock: ordinals_p2tr.witness![ordinals_p2tr.witness!.length - 1],
      },
    ],
  });

  psbt.addOutput({
    address: receiveAddress, //Destination Address
    value: inscriptionUtxoInfo.value,
  });

  for (let i = 0; i < contentsLength; i++) {
    psbt.addOutput({
      address: receiveAddress, //Destination Address
      value: padding,
    })
  };

  psbt.setMaximumFeeRate(MAXIMUMFEERATE);
  const responseData = await signAndSend(keyPair, psbt);
  console.log(`Inscription Tx: ${responseData.txid}`)
  return responseData
}

async function signAndSend(
  keypair: BTCSigner,
  psbt: Psbt,
) {
  const signer = tweakSigner(keypair, { network })
  psbt.signInput(0, signer);
  psbt.signInput(1, keypair);
  psbt.finalizeAllInputs()
  const tx = psbt.extractTransaction();

  const txid = await pushBTCpmt(tx.toHex(), networkConfig.networkType);

  return { isSuccess: true, txid: txid }
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

const redeemPsbtCalculateFee = async (contentsLength: number, inscriptionUtxoInfo: IUtxo, ordinals_p2tr: any, ordinlas_redeem: any, feeRate: number, receiveAddress: string, padding: number): Promise<number> => {
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
  })

  for (let i = 0; i < contentsLength; i++) {
    redeemPsbt.addOutput({
      address: receiveAddress, //Destination Address
      value: padding,
    })
  };

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
