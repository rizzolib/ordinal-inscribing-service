import * as bitcoin from "bitcoinjs-lib";
import { initEccLib, networks } from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import BIP32Factory, { type BIP32Interface } from "bip32";
import ECPairFactory, { type ECPairInterface } from "ecpair";
import dotenv from "dotenv";
import { type PublicKey, SecretKey } from "@cmdcode/crypto-utils";
import { TESTNET } from "../../config/network.config";

interface IWIFWallet {
  networkType: string;
  privateKey: string;
}

dotenv.config();
initEccLib(ecc);

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);



export class WIFWallet {
  private network: bitcoin.networks.Network;
  public ecPair: ECPairInterface;
  public address: string;
  public output: Buffer;
  public publicKey: string;
  public seckey?: SecretKey;
  public secret: any;
  public pubkey: PublicKey;
  
  constructor(walletParam: IWIFWallet) {
    if (walletParam.networkType == TESTNET) {
      this.network = networks.testnet;
    } else {
      this.network = networks.bitcoin;
    }

    this.ecPair = ECPair.fromWIF(walletParam.privateKey, this.network);

    this.secret = this.ecPair.privateKey?.toString('hex');
    this.seckey = new SecretKey(this.secret, { type: "taproot" });
    this.pubkey = this.seckey.pub;

    const { address, output } = bitcoin.payments.p2tr({
      internalPubkey: this.ecPair.publicKey.subarray(1, 33),
      network: this.network,
    });
    this.address = address as string;
    this.output = output as Buffer;
    this.publicKey = this.ecPair.publicKey.toString("hex");
  }

  signPsbt(psbt: bitcoin.Psbt, ecPair: ECPairInterface): bitcoin.Psbt {
    const tweakedChildNode = ecPair.tweak(
      bitcoin.crypto.taggedHash("TapTweak", ecPair.publicKey.subarray(1, 33))
    );

    for (let i = 0; i < psbt.inputCount; i++) {
      psbt.signInput(i, tweakedChildNode);
      psbt.validateSignaturesOfInput(i, () => true);
      psbt.finalizeInput(i);
    }
    return psbt;
  }
}
