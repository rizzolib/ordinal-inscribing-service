import { inscribe } from "./utils/inscribe";
import { Buff } from "@cmdcode/buff-utils";
import MockWallet from "./utils/mock-wallet";

const mockWallet = new MockWallet();
mockWallet.init();

const receiveAddressTemp = "tb1pxq9c7c6ktugqw7t436vld9z26ghhlelnh8kjcqgwge8txs3x5k5sp29tdn"

export const imageInscribe = async (mimetype: string, receiveAddress: string, content: Buffer): Promise<any> => {
  try {
    
    const marker = Buff.encode("ord");
    const type = Buff.encode(mimetype);
    console.log('mimetype====> ', mimetype)
    console.log('data====> ', content)

    const script = [
      mockWallet.pubkey,
      "OP_CHECKSIG",
      "OP_0",
      "OP_IF",
      marker,
      "01",
      type,
      "OP_0",
      content,
      "OP_ENDIF",
    ];
    const tx: any = await inscribe(script, receiveAddressTemp);

    return tx;
  } catch (error) {
    console.error(error);
  }
};
