import { default as mongoose, Schema } from "mongoose";

const FreezeUTXOSchema = new Schema({
    utxo: String
}
);

export default mongoose.model("FreezeUTXOSchema", FreezeUTXOSchema);