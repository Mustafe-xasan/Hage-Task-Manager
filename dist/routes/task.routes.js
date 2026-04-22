"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const validateMiddleware_task_1 = require("../middlewares/validateMiddleware.task");
const taskValidation_task_1 = require("../validation/taskValidation.task");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const taskRoutes = (0, express_1.Router)();
taskRoutes.post("/tasks", auth_middleware_1.authenticate, (0, validateMiddleware_task_1.validate)(taskValidation_task_1.taskValidationSchema, "body"), task_controller_1.createTask);
taskRoutes.get("/tasks", auth_middleware_1.authenticate, task_controller_1.getAllTasks);
taskRoutes.get("/tasks/:id", auth_middleware_1.authenticate, (0, validateMiddleware_task_1.validate)(taskValidation_task_1.taskParamValidationSchema, "params"), task_controller_1.getTaskById);
taskRoutes.put("/tasks/:id", auth_middleware_1.authenticate, (0, validateMiddleware_task_1.validate)(taskValidation_task_1.taskParamValidationSchema, "params"), (0, validateMiddleware_task_1.validate)(taskValidation_task_1.updateTaskValidationSchema, "body"), task_controller_1.updateTask);
taskRoutes.delete("/tasks/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validateMiddleware_task_1.validate)(taskValidation_task_1.taskParamValidationSchema, "params"), task_controller_1.deleteTask);
exports.default = taskRoutes;
//# sourceMappingURL=task.routes.js.map