"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskParamValidationSchema = exports.updateTaskValidationSchema = exports.taskValidationSchema = void 0;
const zod_1 = require("zod");
const tasks_types_1 = require("../types/tasks.types");
// Validation schema for creating a task
exports.taskValidationSchema = zod_1.z.object({
    taskTitle: zod_1.z.string().min(3, "Title must be at least 3 characters"),
    taskDescription: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    priority: zod_1.z.nativeEnum(tasks_types_1.Priority, {
        message: "Priority must be low, medium, or high"
    }),
    status: zod_1.z.nativeEnum(tasks_types_1.Status, {
        message: "Status must be pending, in_progress, or completed"
    }),
});
//  Validation schema for updating a task 
exports.updateTaskValidationSchema = exports.taskValidationSchema.partial();
// Validation schema for task ID parameter
const regEx = /^\d+$/;
exports.taskParamValidationSchema = zod_1.z.object({
    id: zod_1.z.string().regex(regEx, "ID must be a number")
});
//# sourceMappingURL=taskValidation.task.js.map