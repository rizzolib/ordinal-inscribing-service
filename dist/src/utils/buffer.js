"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toXOnly = exports.splitBuffer = void 0;
const splitBuffer = (buffer, chunkSize) => {
    let chunks = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.subarray(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
};
exports.splitBuffer = splitBuffer;
const toXOnly = (pubkey) => {
    return pubkey.subarray(1, 33);
};
exports.toXOnly = toXOnly;
