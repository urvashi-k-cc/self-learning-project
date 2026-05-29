import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./config/database";
import userRoutes from "./routes/user.route";
import projectRoutes from "./routes/project.route";
import teamRoutes from "./routes/team.route";
import taskRoutes from "./routes/task.route";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 9000;

// Correct CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (_, res) => {
  res.send("Backend running");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });