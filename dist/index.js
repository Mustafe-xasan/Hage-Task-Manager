"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = __importDefault(require("./App"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, 'config', '.env') });
const db_1 = require("./config/db");
const PORT = Number(process.env.PORT ?? 3500);
(async () => {
    try {
        await (0, db_1.connectDB)();
        App_1.default.listen(PORT, () => {
            console.log(`Example app listening at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map