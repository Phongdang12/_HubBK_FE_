"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_controller_1 = __importDefault(require("../App/Controllers/auth.controller"));
const auth_1 = require("../App/Middlewares/auth");
router.post('/login', auth_controller_1.default.postLogin);
router.post('/logout', auth_1.verifyToken, auth_controller_1.default.postLogout);
exports.default = router;
