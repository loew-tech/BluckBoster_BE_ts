import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import moviesRouter from "./routes/movies.js";
import membersRouter from "./routes/members.js";

const app = express();
const PORT = process.env.PORT || 8080;
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/members", membersRouter);

app.get("/", (req, res) => {
  return res.status(200).json("hello BB-typescript");
});

// Error handling middleware (standard practice is goes at bottom)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
