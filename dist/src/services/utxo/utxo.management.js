"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSendBTCUTXOArray = void 0;
const getSendBTCUTXOArray = (utxoArray, amount) => {
    let utxoSum = 0;
    let iterator = 0;
    let newUtxoArray = [];
    let filteredUtxoArray = utxoArray.filter(utxo => utxo.value > 1000);
    let filteredSum = filteredUtxoArray.reduce((accum, utxo) => accum + utxo.value, 0);
    if (filteredSum < amount) {
        return { isSuccess: false, data: newUtxoArray };
    }
    while (utxoSum <= amount) {
        utxoSum += filteredUtxoArray[iterator].value;
        newUtxoArray.push(filteredUtxoArray[iterator]);
        iterator++;
    }
    return { isSuccess: true, data: newUtxoArray };
};
exports.getSendBTCUTXOArray = getSendBTCUTXOArray;
