import app from "./App";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'config', '.env') });
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT ?? 3500);

(async () => {
  try {
    await connectDB();
    app.listen(PORT, (): void => {
      console.log(`Example app listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
})();


