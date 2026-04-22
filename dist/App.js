"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
// middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true
}));
// routes
app.get("/", (req, res) => {
    res.send("Hello World! HI");
});
app.use("/api", task_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
// error handler (must be last)
app.use(errorMiddleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=App.js.map