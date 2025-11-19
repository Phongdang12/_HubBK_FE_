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
exports.logout = exports.login = void 0;
exports.seedUser = seedUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../Config/db.config"));
const ApiErorr_1 = require("../utils/ApiErorr");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
function seedUser() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user_name = 'sManager';
            const plainPassword = 'admin123';
            // Check if user already exists
            const [rows] = yield db_config_1.default.query('SELECT check_user_exists(?) AS user_exists', [user_name]);
            const userExistsRows = rows;
            if ((_a = userExistsRows[0]) === null || _a === void 0 ? void 0 : _a.user_exists) {
                console.log(`User ${user_name} already exists, skipping seed`);
                return;
            }
            const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, 10);
            yield db_config_1.default.query('CALL insert_manager_dorm(?, ?)', [
                user_name,
                hashedPassword,
            ]);
            console.log(`User ${user_name} seeded with password: ${plainPassword}`);
        }
        catch (error) {
            console.error('Error seeding user:', error);
        }
    });
}
const login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { user_name, password } = data;
    try {
        const [rows] = yield db_config_1.default.query('SELECT check_user_exists(?) AS user_exists', [user_name]);
        const userExistsRows = rows;
        if (!((_a = userExistsRows[0]) === null || _a === void 0 ? void 0 : _a.user_exists)) {
            throw new ApiErorr_1.ApiError(404, 'Manager not found');
        }
        const [managerRows] = yield db_config_1.default.query('CALL get_manager_dorm_by_username(?)', [user_name]);
        const managerList = managerRows[0];
        const manager = managerList[0];
        if (!manager) {
            throw new ApiErorr_1.ApiError(404, 'Manager not found');
        }
        const isMatch = yield bcryptjs_1.default.compare(password, manager.password);
        if (!isMatch) {
            throw new ApiErorr_1.ApiError(401, 'Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ user_name: manager.user_name }, JWT_SECRET, {
            expiresIn: '1h',
        });
        return {
            token,
            user: { user_name: manager.user_name },
        };
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof ApiErorr_1.ApiError) {
            throw error;
        }
        throw new ApiErorr_1.ApiError(500, 'An unexpected error occurred during login');
    }
});
exports.login = login;
const logout = (_req) => __awaiter(void 0, void 0, void 0, function* () {
    return;
});
exports.logout = logout;
