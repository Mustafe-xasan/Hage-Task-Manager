import { NextFunction, Request, Response } from "express";
import { CreateTaskDTO, Priority, TaskParams, TaskFilters } from "../types/tasks.types";
import {
    createTaskService,
    getAllTasksService,
    getTaskByIdService,
    updateTaskService,
    deleteTaskService,
} from "../services/task.services";
import { successResponse } from "../utility/responseHelper";
import { AppError } from "../utility/AppError";

export const createTask = async (
    req: Request<{}, {}, CreateTaskDTO>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        const newTask = await createTaskService({ ...req.body, userId });
        return res.status(201).json(successResponse("Successfully created a new task", newTask));
    } catch (error: unknown) {
        next(error);
    }
};

export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        // getting the pagination as query params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10

        // geting the filters as query params
        const filters: TaskFilters = {
            status: req.query.status as string,
            priority: req.query.priority as string,
        }

        // Role-based filtering: Users only see their own, Admins see all
        if (user?.role === 'user') {
            filters.userId = user.userId;
        }

        // getting order by as query params
        const sort = req.query.sort as string || "createdAt"
        const order = req.query.order as string || "DESC"

        const tasks = await getAllTasksService(page, limit, filters, sort, order);
        
        return res.status(200).json(successResponse("Tasks retrieved successfully", tasks));
    } catch (error: unknown) {
        next(error);
    }
};

export const getTaskById = async (
    req: Request<TaskParams, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        
        // If user is regular user, only allow fetching their own task
        const userId = user?.role === 'user' ? user.userId : undefined;
        
        const task = await getTaskByIdService(id, userId);
        
        return res.status(200).json(successResponse(`Task with the ID of ${id}`, task));
    } catch (error: unknown) {
        next(error);
    }
};

export const updateTask = async (
    req: Request<TaskParams, {}, Partial<CreateTaskDTO>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;

        // If regular user, restrict update to owned tokens
        const ownerId = user?.role === 'user' ? user.userId : undefined;

        const updatedTask = await updateTaskService(id, req.body, ownerId);
        
        return res.status(200).json(successResponse("Successfully updated", updatedTask));
    } catch (error: unknown) {
        next(error);
    }
};

export const deleteTask = async (
    req: Request<TaskParams, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;

        // If regular user, restrict deletion to owned tasks
        const ownerId = user?.role === 'user' ? user.userId : undefined;

        const deletedTask = await deleteTaskService(id, ownerId);
        
        return res.status(200).json(successResponse("Successfully deleted", deletedTask));
    } catch (error: unknown) {
        next(error);
    }
};












