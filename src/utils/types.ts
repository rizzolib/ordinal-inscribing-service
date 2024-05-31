
export interface IFile {
    mimetype: string,
    data: Buffer
}

export interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

export interface ITextInscription {
    receiveAddress: string,
    contents: Array<string>,
    feeRate: number,
    padding: number,
    parentId: string,
    metadata: string,
    metaprotocol: string,
    reinscriptionId: string,
}

export interface IFileInscription {
    receiveAddress: string,
    files: Array<IFile>,
    feeRate: number,
    padding: number,
    parentId: string,
    metadata: string,
    metaprotocol: string,
    reinscriptionId: string,
}

export interface IDelegateInscription {
    receiveAddress: string,
    delegateIds: Array<string>,
    feeRate: number,
    padding: number,
    parentId: string,
    metadata: string,
    metaprotocol: string,
    reinscriptionId: string,
}

export interface ISendingOrdinalData {
    receiveAddress: string,
    parentId: string,
    reinscriptionId: string,
    feeRate: number,
    btcAmount: number,
    publicKey: string
}