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