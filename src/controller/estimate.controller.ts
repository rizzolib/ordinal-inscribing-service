import { ITextInscription } from "../utils/types";
import { Response } from "express";
import { textTapScript } from "../services/tapscript/textTapScript";

export const  TextEstimateFeeController = async (inscriptionData: ITextInscription, res: Response) => {

    const tapScript = await textTapScript(inscriptionData);

    console.log('tapScript => ', tapScript);
    
    res.status(200).send(tapScript);
}