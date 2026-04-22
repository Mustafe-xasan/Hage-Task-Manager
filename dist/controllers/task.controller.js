"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getAllTasks = exports.createTask = void 0;
const task_services_1 = require("../services/task.services");
const responseHelper_1 = require("../utility/responseHelper");
const createTask = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const newTask = await (0, task_services_1.createTaskService)({ ...req.body, userId });
        return res.status(201).json((0, responseHelper_1.successResponse)("Successfully created a new task", newTask));
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const getAllTasks = async (req, res, next) => {
    try {
        const user = req.user;
        // getting the pagination as query params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        // geting the filters as query params
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
        };
        // Role-based filtering: Users only see their own, Admins see all
        if (user?.role === 'user') {
            filters.userId = user.userId;
        }
        // getting order by as query params
        const sort = req.query.sort || "createdAt";
        const order = req.query.order || "DESC";
        const tasks = await (0, task_services_1.getAllTasksService)(page, limit, filters, sort, order);
        return res.status(200).json((0, responseHelper_1.successResponse)("Tasks retrieved successfully", tasks));
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        // If user is regular user, only allow fetching their own task
        const userId = user?.role === 'user' ? user.userId : undefined;
        const task = await (0, task_services_1.getTaskByIdService)(id, userId);
        return res.status(200).json((0, responseHelper_1.successResponse)(`Task with the ID of ${id}`, task));
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        // If regular user, restrict update to owned tokens
        const ownerId = user?.role === 'user' ? user.userId : undefined;
        const updatedTask = await (0, task_services_1.updateTaskService)(id, req.body, ownerId);
        return res.status(200).json((0, responseHelper_1.successResponse)("Successfully updated", updatedTask));
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        // If regular user, restrict deletion to owned tasks
        const ownerId = user?.role === 'user' ? user.userId : undefined;
        const deletedTask = await (0, task_services_1.deleteTaskService)(id, ownerId);
        return res.status(200).json((0, responseHelper_1.successResponse)("Successfully deleted", deletedTask));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=task.controller.js.map