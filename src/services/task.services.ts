import pool from "../config/db";
import { Task, CreateTaskDTO, TaskFilters } from "../types/tasks.types";
import { AppError } from "../utility/AppError";

// CREATE
export const createTaskService = async (data: CreateTaskDTO): Promise<Task> => {
    try {
        const query = `
            INSERT INTO tasks (taskTitle, taskDescription, priority, status, userId)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"
        `;

        const { taskTitle, taskDescription, priority, status, userId } = data;

        const result = await pool.query<Task>(query, [
            taskTitle,
            taskDescription,
            priority,
            status,
            userId,
        ]);

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};


// GET ALL
export const getAllTasksService = async (
    page: number,
    limit: number,
    filters: TaskFilters,
    sort: string,
    order: string
): Promise<Task[]> => {

    const offset = (page - 1) * limit;

    const values: any[] = [];
    const conditions: string[] = [];

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

    const result = await pool.query<Task>(query, values);

    return result.rows;
};


export const getTaskByIdService = async (id: number, userId?: number): Promise<Task> => {
    let query = `SELECT taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt" FROM tasks WHERE taskId = $1`;
    const params: any[] = [id];

    if (userId) {
        params.push(userId);
        query += ` AND userId = $2`;
    }

    try {
        const result = await pool.query<Task>(query, params);

        if (result.rows.length === 0) {
            throw new AppError("Task not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        throw error;
    }
};


export const updateTaskService = async (
    id: number,
    data: Partial<CreateTaskDTO>,
    ownerId?: number
): Promise<Task> => {

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
    
    const params: any[] = [taskTitle, taskDescription, priority, status, id];

    if (ownerId) {
        params.push(ownerId);
        query += ` AND userId = $6`;
    }

    query += ` RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"`;

    try {

        const result = await pool.query<Task>(query, params);

        if (result.rows.length === 0) {
            throw new AppError("Task not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        throw error;
    }
};


export const deleteTaskService = async (id: number, ownerId?: number): Promise<Task> => {
    let query = `DELETE FROM tasks WHERE taskId = $1`;
    const params: any[] = [id];

    if (ownerId) {
        params.push(ownerId);
        query += ` AND userId = $2`;
    }

    query += ` RETURNING taskId AS "taskId", taskTitle AS "taskTitle", taskDescription AS "taskDescription", priority, status, userId AS "userId", createdAt AS "createdAt"`;

    try {

        const result = await pool.query<Task>(query, params);

        if (result.rows.length === 0) {
            throw new AppError("Task not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        throw error;
    }
};