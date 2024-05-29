import { ITextInscription, IUtxo } from "../../utils/types"
import wallet from "../wallet/initializeWallet"
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
import { getInscriptionInfo } from "../../utils/unisat.api";
import { TESTNET } from "../../config/network.config";
import cbor from 'cbor';
import { splitBuffer } from "../../utils/buffer";
import { toXOnly } from "../../utils/buffer";

const keyPair = wallet.ecPair;

export const textTapScript = async (inscrptionData: ITextInscription) => {

    let tapScript: Array<any> = [
        toXOnly(keyPair.publicKey),
        opcodes.OP_CHECKSIG
    ];
    let pointers: Array<number> = [];

    inscrptionData.contents.forEach((item: string, index: number) => {
        pointers.push(index * inscrptionData.padding);
    })

    if (inscrptionData.parentId) {
        let parentInscriptionUTXO: IUtxo = await getInscriptionInfo(inscrptionData.parentId, TESTNET);
        pointers = pointers.map((pointer, index) => {
            return pointer + parentInscriptionUTXO.value
        })
    }

    let pointerBuffer: Array<Buffer> = [];
    pointerBuffer = pointers.map((pointer, index) => {
        return Buffer.from(pointer.toString(16).padStart(4, '0'), 'hex').reverse()
    })
    const parts = inscrptionData.parentId.split('i');
    const parentInscriptionTransactionID = parts[0];
    const inscriptionTransactionBuffer = Buffer.from(parentInscriptionTransactionID, 'hex').reverse();
    const index = parts[1];
    const indexBuffer = Buffer.from(parseInt(index, 10).toString(16).padStart(2, '0'), 'hex').reverse();
    const parentInscriptionBuffer = Buffer.concat([inscriptionTransactionBuffer, indexBuffer]);

    for (let i = 0; i < inscrptionData.contents.length; i++) {
        const contentBuffer = Buffer.from(inscrptionData.contents[i]);
        const contentBufferArray: Array<Buffer> = splitBuffer(contentBuffer, 450);

        let subScript: Array<any> = [];
        subScript.push(
            opcodes.OP_FALSE,
            opcodes.OP_IF,
            Buffer.from("ord", "utf8"),
            1,
            1,
            Buffer.from('text/plain', "utf8")
        );

        subScript.push(
            1,
            2,
            pointerBuffer[i]
        )

        subScript.push(
            1,
            3,
            parentInscriptionBuffer
        )

        if (inscrptionData.metadata) {
            subScript.push(
                1,
                5,
                cbor.encode(inscrptionData.metadata)
            )
        }

        if (inscrptionData.metaprotocol) {
            subScript.push(
                1,
                7,
                Buffer.from(inscrptionData.metaprotocol, "utf8"),
            )
        }

        subScript.push(
            opcodes.OP_0
        )

        contentBufferArray.forEach((item: Buffer) => {
            subScript.push(item)
        })

        subScript.push(
            opcodes.OP_ENDIF
        );

        tapScript.push(...subScript)
    }
    return tapScript;   
}
