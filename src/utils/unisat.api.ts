import axios, { type AxiosError } from "axios";
import { TESTNET } from "../config/network.config";
import dotenv from "dotenv";

interface IUtxo {
  txid: string;
  vout: number;
  value: number;
}

dotenv.config();

export const getInscriptionInfo = async (
  inscriptionid: string,
  networkType: string
): Promise<any> => {
  try {
    const url = `https://open-api${
      networkType == TESTNET ? "-testnet" : ""
    }.unisat.io/v1/indexer/inscription/info/${inscriptionid}`;

    console.log(url);

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
      },
    });
    const inscriptionInfo = res.data;
    const info: IUtxo = {
      txid: inscriptionInfo.data.utxo.txid,
      vout: inscriptionInfo.data.utxo.vout,
      value: inscriptionInfo.data.utxo.satoshi,
    };

    return info;
  } catch (err: any) {
    console.log("Get Utxos Error");
  }
};

// Get BTC UTXO
export const getBtcUtxoInfo = async (address: string, networkType: string) => {
  const url = `https://open-api${
    networkType == TESTNET ? "-testnet" : ""
  }.unisat.io/v1/indexer/address/${address}/utxo-data`;

  console.log(url);

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
    },
  };
  let cursor = 0;
  const size = 5000;
  let data = {};
  let utxos: IUtxo[] = [];
  while (1) {
    const res = await axios.get(url, { ...config, params: { cursor, size } });
    if (res.data.code === -1) throw "Invalid Address";
    let fetchUtxos = res.data.data.utxo.reverse();
    utxos.push(
      ...(fetchUtxos as any[]).map((utxo) => {
        return {
          txid: utxo.txid,
          value: utxo.satoshi,
          vout: utxo.vout,
        };
      })
    );
    cursor += fetchUtxos.length;

    if (cursor >= res.data.data.total - res.data.data.totalRunes) break;
  }

  return utxos;
};
