"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskService = exports.updateTaskService = exports.getTaskByIdService = exports.getAllTasksService = exports.createTaskService = void 0;
const db_1 = __importDefault(require("../config/db"));
const AppError_1 = require("../utility/AppError");
// CREATE
const createTaskService = async (data) => {
    try {
        const query = `
            INSERT INTO tasks (taskTitle, taskDescription, priority, status, userId)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"
        `;
        const { taskTitle, taskDescription, priority, status, userId } = data;
        const result = await db_1.default.query(query, [
            taskTitle,
            taskDescription,
            priority,
            status,
            userId,
        ]);
        return result.rows[0];
    }
    catch (error) {
        throw error;
    }
};
exports.createTaskService = createTaskService;
// GET ALL
const getAllTasksService = async (page, limit, filters, sort, order) => {
    const offset = (page - 1) * limit;
    const values = [];
    const conditions = [];
    if (filters.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
    }
    if (filters.priority) {
        values.push(filters.priority);
        conditions.push(`priority = $${values.length}`);
    }
    if (filters.userId) {
        values.push(filters.userId);
        conditions.push(`userId = $${values.length}`);
    }
    let query = `SELECT taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt" FROM tasks`;
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
    }
    // clean sort and order to prevent SQL injection
    const allowedSortFields = ["taskId", "taskTitle", "priority", "status", "createdAt"];
    const validSort = allowedSortFields.includes(sort) ? sort : "createdAt";
    const validOrder = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${validSort} ${validOrder}`;
    values.push(limit);
    values.push(offset);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;
    query += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    const result = await db_1.default.query(query, values);
    return result.rows;
};
exports.getAllTasksService = getAllTasksService;
const getTaskByIdService = async (id, userId) => {
    let query = `SELECT taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt" FROM tasks WHERE taskId = $1`;
    const params = [id];
    if (userId) {
        params.push(userId);
        query += ` AND userId = $2`;
    }
    try {
        const result = await db_1.default.query(query, params);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        return result.rows[0];
    }
    catch (error) {
        throw error;
    }
};
exports.getTaskByIdService = getTaskByIdService;
const updateTaskService = async (id, data, ownerId) => {
    const { taskTitle, taskDescription, priority, status } = data;
    let query = `
        UPDATE tasks
        SET
          taskTitle = COALESCE($1, taskTitle),
          taskDescription = COALESCE($2, taskDescription),
          priority = COALESCE($3, priority),
          status = COALESCE($4, status),
          updatedAt = CURRENT_TIMESTAMP
        WHERE taskId = $5
    `;
    const params = [taskTitle, taskDescription, priority, status, id];
    if (ownerId) {
        params.push(ownerId);
        query += ` AND userId = $6`;
    }
    query += ` RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"`;
    try {
        const result = await db_1.default.query(query, params);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        return result.rows[0];
    }
    catch (error) {
        throw error;
    }
};
exports.updateTaskService = updateTaskService;
const deleteTaskService = async (id, ownerId) => {
    let query = `DELETE FROM tasks WHERE taskId = $1`;
    const params = [id];
    if (ownerId) {
        params.push(ownerId);
        query += ` AND userId = $2`;
    }
    query += ` RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"`;
    try {
        const result = await db_1.default.query(query, params);
        if (result.rows.length === 0) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        return result.rows[0];
    }
    catch (error) {
        throw error;
    }
};
exports.deleteTaskService = deleteTaskService;
//# sourceMappingURL=task.services.js.map