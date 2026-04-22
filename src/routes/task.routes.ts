import { Router } from "express";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from "../controllers/task.controller";
import { validate } from "../middlewares/validateMiddleware.task";
import { taskValidationSchema, taskParamValidationSchema, updateTaskValidationSchema } from "../validation/taskValidation.task";
import { authenticate, authorize } from "../middlewares/auth.middleware";
const taskRoutes = Router();

taskRoutes.post("/tasks",
    authenticate, validate(taskValidationSchema, "body"), createTask);
taskRoutes.get("/tasks", authenticate, getAllTasks);
taskRoutes.get("/tasks/:id",
    authenticate, validate(taskParamValidationSchema, "params"), getTaskById);
taskRoutes.put("/tasks/:id",
    authenticate,
    validate(taskParamValidationSchema, "params"),
    validate(updateTaskValidationSchema, "body"),
    updateTask);
taskRoutes.delete("/tasks/:id", 
    authenticate, 
    authorize(['admin']), 
    validate(taskParamValidationSchema, "params"), 
    deleteTask);

export default taskRoutes;