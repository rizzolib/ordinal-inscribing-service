"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUtxoFlag = exports.setUtxoFlag = void 0;
const __1 = require("../..");
const __2 = require("../..");
const setUtxoFlag = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const release = yield __1.flagMutex.acquire();
    try {
        // Perform actions with the flag variable
        __2.app.locals.utxoflag = value;
    }
    finally {
        release();
    }
});
exports.setUtxoFlag = setUtxoFlag;
function waitUtxoFlag() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let intervalId;
            const checkForUtxo = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!__2.app.locals.utxoflag) {
                        resolve();
                        clearInterval(intervalId);
                    }
                }
                catch (error) {
                    reject(error);
                    clearInterval(intervalId);
                }
            });
            intervalId = setInterval(checkForUtxo, 1000);
        });
    });
}
exports.waitUtxoFlag = waitUtxoFlag;
