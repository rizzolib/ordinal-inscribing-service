import axios, { type AxiosError } from "axios";
import { TESTNET } from "../config/network.config";
import dotenv from 'dotenv';

interface IUtxo {
    txid: string;
    vout: number;
    value: number;
}

dotenv.config();

export const getInscriptionInfo = async (inscriptionid: string, networkType: string): Promise<any> => {
    try {
        const url = `https://open-api${networkType == TESTNET ? '-testnet' : ''}.unisat.io/v1/indexer/inscription/info/${inscriptionid}`;
        const res = await axios.get(url,
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
                },
            });
        const inscriptionInfo = res.data;
        const info: IUtxo = {
            txid: inscriptionInfo.data.utxo.txid,
            vout: inscriptionInfo.data.utxo.vout,
            value: inscriptionInfo.data.utxo.satoshi
        }

        return info;
    } catch (err: any) {
        console.log('Get Utxos Error')
    }
};

// Get BTC UTXO
export const getBtcUtxoInfo = async (address: string, networkType: string) => {
    const url = `https://open-api${networkType == TESTNET ? '-testnet' : ''}.unisat.io/v1/indexer/address/${address}/utxo-data`;
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.OPENAPI_UNISAT_TOKEN}`,
      },
    };
    let cursor = 0;
    const size = 5000;
    let utxos: IUtxo[] = [];
    while (1) {
      const res = await axios.get(url, { ...config, params: { cursor, size } });
      if (res.data.code === -1) throw "Invalid Address";
      utxos.push(
        ...(res.data.data.utxo as any[]).map((utxo) => {
          return {
            txid: utxo.txid,
            value: utxo.satoshi,
            vout: utxo.vout,
          };
        })
      );
      cursor += res.data.data.utxo.length;
      if (cursor >= res.data.data.total - res.data.data.totalRunes) break;
    }
    
    return utxos;
  };
  