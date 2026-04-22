export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

export enum Status {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}

export interface CreateTaskDTO {
    taskTitle: string;
    taskDescription: string;
    priority: Priority;
    status: Status;
    userId?: number; // Optional in DTO because we inject it in controller
}


import { ParamsDictionary } from "express-serve-static-core";

export interface TaskParams extends ParamsDictionary {
    id: string
}

export interface Task {
    taskId: number;
    taskTitle: string;
    taskDescription: string;
    priority: string;
    status: string;
    userId: number;
    createdAt: Date;
}


export interface TaskFilters {
    status?: string;
    priority?: string;
    userId?: number;
}