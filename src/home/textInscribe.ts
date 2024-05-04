import { inscribe } from "./utils/inscribe";
import { Buff } from "@cmdcode/buff-utils";
import MockWallet from "./utils/mock-wallet";

const mockWallet = new MockWallet();
mockWallet.init();

const InscribeText = "Text Inscription Chainwave"

const ReceiveAddress = "tb1pxq9c7c6ktugqw7t436vld9z26ghhlelnh8kjcqgwge8txs3x5k5sp29tdn"

export const textInscribe = async (receiveAddress: string, content: string): Promise<any> => {
  try {
    const marker = Buff.encode("ord");
    const mimetype = Buff.encode("text/plain");
    const data = Buff.encode(InscribeText);

    const script = [
      mockWallet.pubkey,
      "OP_CHECKSIG",
      "OP_0",
      "OP_IF",
      marker,
      "01",
      mimetype,
      "OP_0",
      data,
      "OP_ENDIF",
    ];
    const tx = await inscribe(script, ReceiveAddress);
    
    return tx;
  } catch (error) {
    console.error(error);
  }
};