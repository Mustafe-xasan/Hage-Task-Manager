import express, { Request, Response } from 'express';
import cors from "cors";
import taskRoutes from "./routes/task.routes";
import { errorMiddleware } from './middlewares/errorMiddleware';
import authRoutes from './routes/auth.routes';
import { globalLimiter, authLimiter } from './middlewares/rateLimiter';
const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use("/api/auth", authLimiter)
app.use("/api", globalLimiter)


// routes
app.get("/", (req: Request, res: Response) => {
    res.send("Hello World! HI");
});

app.use("/api/auth", authRoutes)
app.use("/api", taskRoutes)


// error handler (must be last)
app.use(errorMiddleware)

export default app;





























