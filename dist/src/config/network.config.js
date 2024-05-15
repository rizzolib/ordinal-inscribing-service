"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const networkConfig = {
    walletType: process.env.PRIVATE_KEY ? 'WIF' : 'SEED',
    networkType: process.env.NETWORKTYPE,
};
exports.default = networkConfig;
