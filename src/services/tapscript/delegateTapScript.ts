import { IDelegateInscription, IUtxo } from "../../utils/types"
import wallet from "../wallet/initializeWallet"
import { opcodes } from "bitcoinjs-lib";
import { getInscriptionInfo } from "../../utils/unisat.api";
import networkConfig from "../../config/network.config";
import cbor from 'cbor';
import { toXOnly } from "../../utils/buffer";

const keyPair = wallet.ecPair;

export const delegateTapScript = async (inscriptionData: IDelegateInscription) => {

    let tapScript: Array<any> = [
        toXOnly(keyPair.publicKey),
        opcodes.OP_CHECKSIG
    ];
    let pointers: Array<number> = [];

    inscriptionData.delegateIds.forEach((item: string, index: number) => {
        pointers.push(index * inscriptionData.padding);
    })

    if (inscriptionData.parentId) {
        let parentInscriptionUTXO: IUtxo = await getInscriptionInfo(inscriptionData.parentId, networkConfig.networkType);
        pointers = pointers.map((pointer, index) => {
            return pointer + parentInscriptionUTXO.value
        })
    }

    let pointerBuffer: Array<Buffer> = [];
    pointerBuffer = pointers.map((pointer, index) => {
        return Buffer.from(pointer.toString(16).padStart(4, '0'), 'hex').reverse()
    })
    const parts = inscriptionData.parentId.split('i');
    const parentInscriptionTransactionID = parts[0];
    const inscriptionTransactionBuffer = Buffer.from(parentInscriptionTransactionID, 'hex').reverse();

    let parentInscriptionBuffer: Buffer;
    const index = parts[1];

    if(parseInt(index, 10) != 0) {
        const indexBuffer = Buffer.from(parseInt(index, 10).toString(16).padStart(2, '0'), 'hex').reverse();
        parentInscriptionBuffer = Buffer.concat([inscriptionTransactionBuffer, indexBuffer]);
    } else {
        parentInscriptionBuffer = inscriptionTransactionBuffer;
    }
    
    const DelegateIDparts = inscriptionData.delegateIds[0].split('i');
    const delegateInscriptionTransactionID = DelegateIDparts[0];
    const DelegateinscriptionTransactionBuffer = Buffer.from(delegateInscriptionTransactionID, 'hex').reverse();


    let DelegateInscriptionBuffer: Buffer;
    const DelegateIndex = DelegateIDparts[1];

    if(parseInt(DelegateIndex, 10) != 0) {
        const DelegateIndexBuffer = Buffer.from(parseInt(DelegateIndex, 10).toString(16).padStart(2, '0'), 'hex').reverse();
        DelegateInscriptionBuffer = Buffer.concat([DelegateinscriptionTransactionBuffer, DelegateIndexBuffer]);
    } else {
        DelegateInscriptionBuffer = DelegateinscriptionTransactionBuffer;
    }

    for (let i = 0; i < inscriptionData.delegateIds.length; i++) {

        let subScript: Array<any> = [];
        subScript.push(
            opcodes.OP_FALSE,
            opcodes.OP_IF,
            Buffer.from("ord", "utf8"),
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

        if (inscriptionData.metadata) {
            subScript.push(
                1,
                5,
                cbor.encode(JSON.parse(inscriptionData.metadata))
            )
        }

        if (inscriptionData.metaprotocol) {
            subScript.push(
                1,
                7,
                Buffer.from(inscriptionData.metaprotocol, "utf8"),
            )
        }
        subScript.push(
            1,
            11,
            DelegateInscriptionBuffer
        )
        subScript.push(
            opcodes.OP_ENDIF
        );
        tapScript.push(...subScript)
    }
    return tapScript;
}
