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
exports.DatabaseExample = void 0;
const db_config_1 = __importDefault(require("../Config/db.config"));
class DatabaseExample {
    // 1. SELECT - Lấy dữ liệu
    static getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield db_config_1.default.execute('SELECT * FROM users');
                return rows;
            }
            catch (error) {
                console.error('Lỗi khi lấy danh sách users:', error);
                throw error;
            }
        });
    }
    // 2. SELECT với tham số - Tránh SQL Injection
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield db_config_1.default.execute('SELECT * FROM users WHERE id = ?', [id]);
                return rows.length > 0 ? rows[0] : null;
            }
            catch (error) {
                console.error('Lỗi khi lấy user:', error);
                throw error;
            }
        });
    }
    // 3. INSERT - Thêm dữ liệu mới
    static createUser(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield db_config_1.default.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
                return result.insertId;
            }
            catch (error) {
                console.error('Lỗi khi tạo user:', error);
                throw error;
            }
        });
    }
    // 4. UPDATE - Cập nhật dữ liệu
    static updateUser(id, name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield db_config_1.default.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error('Lỗi khi cập nhật user:', error);
                throw error;
            }
        });
    }
    // 5. DELETE - Xóa dữ liệu
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield db_config_1.default.execute('DELETE FROM users WHERE id = ?', [id]);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error('Lỗi khi xóa user:', error);
                throw error;
            }
        });
    }
    // 6. Transaction - Thực hiện nhiều thao tác cùng lúc
    static transferMoney(fromUserId, toUserId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield db_config_1.default.getConnection();
            try {
                yield connection.beginTransaction();
                // Trừ tiền từ tài khoản A
                yield connection.execute('UPDATE accounts SET balance = balance - ? WHERE user_id = ?', [amount, fromUserId]);
                // Cộng tiền vào tài khoản B
                yield connection.execute('UPDATE accounts SET balance = balance + ? WHERE user_id = ?', [amount, toUserId]);
                yield connection.commit();
                console.log('Chuyển tiền thành công!');
            }
            catch (error) {
                yield connection.rollback();
                console.error('Lỗi chuyển tiền, đã rollback:', error);
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    // 7. Stored Procedure - Gọi procedure từ database
    static callStoredProcedure(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield db_config_1.default.execute('CALL get_student_info(?)', [studentId]);
                return rows;
            }
            catch (error) {
                console.error('Lỗi khi gọi stored procedure:', error);
                throw error;
            }
        });
    }
    // 8. Join tables - Kết hợp nhiều bảng
    static getUsersWithRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield db_config_1.default.execute(`
        SELECT u.id, u.name, u.email, r.role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
      `);
                return rows;
            }
            catch (error) {
                console.error('Lỗi khi join tables:', error);
                throw error;
            }
        });
    }
}
exports.DatabaseExample = DatabaseExample;
