import axios, { type AxiosError } from "axios";
import { TESTNET } from "../config/network.config";

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

export const getUtxos = async (address: string, networkType: string): Promise<any> => {
  try {
    const url = `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}api/address/${address}/utxo`;
    const res = await axios.get(url);
    const confirmedUtxos: IUtxo[] = [];
    const unConfirmedUtxos: IUtxo[] = [];

    res.data.forEach((utxoData: any) => {
      if (utxoData.status.confirmed) {
        confirmedUtxos.push({
          txid: utxoData.txid,
          vout: utxoData.vout,
          value: utxoData.value,
        });
      } else {
        unConfirmedUtxos.push({
          txid: utxoData.txid,
          vout: utxoData.vout,
          value: utxoData.value,
        });
      }
    });
    return [...confirmedUtxos, ...unConfirmedUtxos];
  } catch (err: any) {
    console.log('Get Utxos Error')
  }
};

export const pushBTCpmt = async (rawtx: any, networkType: string) => {
  const txid = await postData(
    `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}api/tx`,
    rawtx
  );
  return txid;
}

const postData = async (
  url: string,
  json: any,
  content_type = "text/plain",
  apikey = ""
): Promise<string | undefined> => {
  try {
    const headers: any = {};
    if (content_type) headers["Content-Type"] = content_type;
    if (apikey) headers["X-Api-Key"] = apikey;
    const res = await axios.post(url, json, {
      headers,
    });
    return res.data as string;
  } catch (err: any) {
    console.log('Push Transaction Error')
    console.log(err.response.data)
  }
}

export const getPrice = async (networkType: string) => {
  try {
    const url = `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}api/v1/prices`;
    const res: any = await axios.get(url);
    return res.data;
  } catch (error: any) {
    console.log("Get Price Error!")
  }
}

export const getBlockHeight = async (networkType: string) => {
  try {
    const url = `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}/api/blocks/tip/height`;
    const res = await axios.get(url);
    return res.data;
  } catch (error: any) {
    console.log("Get Price Error!")
  }
}

export const getFeeRate = async (networkType: string) => {
  try {
    const height = await getBlockHeight(networkType);
    const url = `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}api/v1/blocks/${height}`;
    const blockData: any = await axios.get(url);
    const feeRateData = blockData.data.map((item: any) => {
      return { timestamp: item.timestamp, avgFeeRate: item.extras.avgFeeRate }
    })
    return feeRateData;
  } catch (error: any) {
    console.log("Get Fee Rate Error!")
  }
}

export const getRecommendedFeeRate = async (networkType: string) => {
  try {
    const url = `https://mempool.space/${networkType == TESTNET ? 'testnet/' : ''}api/v1/fees/recommended`;
    const response: any = await axios.get(url);

    return response.data;
  } catch (error: any) {
    console.log("Get Recommended Fee Rate Error!")
  }
}
