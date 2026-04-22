import { z } from 'zod';

import { Priority, Status } from '../types/tasks.types';

// Validation schema for creating a task
export const taskValidationSchema = z.object({
    taskTitle: z.string().min(3, "Title must be at least 3 characters"),
    taskDescription: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.nativeEnum(Priority, {
        message: "Priority must be low, medium, or high"
    }),
    status: z.nativeEnum(Status, {
        message: "Status must be pending, in_progress, or completed"
    }),
})
//  Validation schema for updating a task 
export const updateTaskValidationSchema = taskValidationSchema.partial();

// Validation schema for task ID parameter
const regEx = /^\d+$/;
export const taskParamValidationSchema = z.object({
    id: z.string().regex(regEx, "ID must be a number")
})