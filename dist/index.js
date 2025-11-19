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
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./Routes/index"));
const cors_1 = __importDefault(require("cors"));
const db_config_1 = __importDefault(require("./Config/db.config"));
const auth_service_1 = require("./Services/auth.service"); //thêm
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
(0, index_1.default)(app);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield db_config_1.default.getConnection();
        console.log('✅ Connected to MySQL');
        conn.release();
        // Seed default manager user
        yield (0, auth_service_1.seedUser)();
    }
    catch (err) {
        console.error('❌ Cannot connect to MySQL:', err);
    }
}))();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
