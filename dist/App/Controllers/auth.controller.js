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
const auth_service_1 = require("../../Services/auth.service");
class AuthController {
    static postLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const result = yield (0, auth_service_1.login)(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                const err = error;
                res
                    .status((_a = err.statusCode) !== null && _a !== void 0 ? _a : 500)
                    .json({ message: (_b = err.message) !== null && _b !== void 0 ? _b : 'An unexpected error occurred' });
            }
        });
    }
    static postLogout(req, res) {
        res
            .status(200)
            .json({ message: 'Logged out (frontend should clear token)' });
    }
}
exports.default = AuthController;
