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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DormitoryCardService = void 0;
const db_config_1 = __importDefault(require("../Config/db.config"));
class DormitoryCardService {
    static checkDormitoryCard(ssn) {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield db_config_1.default.query('SELECT check_dormitory_card(?) AS validity', [ssn]);
            if (Array.isArray(rows) && rows.length > 0) {
                return rows[0].validity; // đúng vì rows[0] là { validity: 0/1/2 }
            }
            else {
                throw new Error('Unexpected result format in checkDormitoryCard');
            }
        });
    }
    static createDormitoryCard(ssn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.default.query('CALL create_dormitory_card(?)', [ssn]);
        });
    }
    static setDormitoryCard(ssn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.default.query('CALL set_validity_dormitory_card(?)', [ssn]);
        });
    }
}
exports.DormitoryCardService = DormitoryCardService;
