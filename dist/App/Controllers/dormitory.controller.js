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
const dormitoryCard_service_1 = require("../../Services/dormitoryCard.service");
class DormitoryCardController {
    static checkDormitoryCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ssn = req.params.ssn;
                const result = yield dormitoryCard_service_1.DormitoryCardService.checkDormitoryCard(ssn);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error checking dormitory card:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    static createDormitoryCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ssn = req.params.ssn;
                const result = yield dormitoryCard_service_1.DormitoryCardService.createDormitoryCard(ssn);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error setting dormitory card:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    static setDormitoryCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ssn = req.params.ssn;
                const result = yield dormitoryCard_service_1.DormitoryCardService.setDormitoryCard(ssn);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error setting dormitory card:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
}
exports.default = DormitoryCardController;
