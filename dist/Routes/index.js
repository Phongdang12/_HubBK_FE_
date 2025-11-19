"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_1 = __importDefault(require("./auth.routes"));
const students_routes_1 = __importDefault(require("./students.routes"));
const statistics_routes_1 = __importDefault(require("./statistics.routes"));
const rooms_routes_1 = __importDefault(require("./rooms.routes"));
const dormitoryCard_routes_1 = __importDefault(require("./dormitoryCard.routes"));
function route(app) {
    app.use('/api/students', students_routes_1.default);
    app.use('/api/statistics', statistics_routes_1.default);
    app.use('/api/rooms', rooms_routes_1.default);
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/dormitoryCard', dormitoryCard_routes_1.default);
}
exports.default = route;
