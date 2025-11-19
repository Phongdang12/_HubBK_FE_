"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const dormitory_controller_1 = __importDefault(require("../App/Controllers/dormitory.controller"));
router.get('/check/:ssn', dormitory_controller_1.default.checkDormitoryCard);
router.put('/set/:ssn', dormitory_controller_1.default.setDormitoryCard);
router.post('/set/:ssn', dormitory_controller_1.default.setDormitoryCard);
exports.default = router;
