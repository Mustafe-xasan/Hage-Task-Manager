"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, ".env") });
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});
const connectDB = async () => {
    try {
        const client = await pool.connect();
        client.release();
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = pool;
//# sourceMappingURL=db.js.map