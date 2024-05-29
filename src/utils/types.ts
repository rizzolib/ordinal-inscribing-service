
export interface IFile {
    mimetype: string,
    data: Buffer
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
    delegateId: string,
    feeRate: number,
    padding: number,
    parentId: string,
    metadata: string,
    metaprotocol: string,
    reinscriptionId: string,
}
