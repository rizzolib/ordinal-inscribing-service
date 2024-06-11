export interface IFile {
  mimetype: string;
  data: Buffer;
}

export interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

export interface ITextInscription {
  receiveAddress: string;
  contents: Array<string>;
  feeRate: number;
  padding: number;
  parentId: string;
  metadata: string;
  metaprotocol: string;
  reinscriptionId: string;
  btcAmount: number;
  sendBtcTxId: string;
  txIndex: number;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
  paymentAddress: string;
  paymentPublicKey: string;
}

export interface IFileInscription {
  receiveAddress: string;
  files: Array<IFile>;
  feeRate: number;
  padding: number;
  parentId: string;
  metadata: string;
  metaprotocol: string;
  reinscriptionId: string;
  btcAmount: number;
  sendBtcTxId: string;
  txIndex: number;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
  paymentAddress: string;
  paymentPublicKey: string;
}

export interface IDelegateInscription {
  receiveAddress: string;
  delegateIds: Array<string>;
  feeRate: number;
  padding: number;
  parentId: string;
  metadata: string;
  metaprotocol: string;
  reinscriptionId: string;
  btcAmount: number;
  sendBtcTxId: string;
  txIndex: number;
  ordinalsAddress: string;
  ordinalsPublicKey: string;
  paymentAddress: string;
  paymentPublicKey: string;
}

export interface ISendingOrdinalData {
  ordinalsAddress: string;
  ordinalsPublicKey: string;
  paymentAddress: string;
  paymentPublicKey: string;
  receiveAddress: string;
  parentId: string;
  reinscriptionId: string;
  feeRate: number;
  btcAmount: number;
}
