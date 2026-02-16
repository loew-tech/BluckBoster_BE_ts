import { Router } from "express";

import * as handler from "../handlers/movies.js";

const router = Router();

router.get("/", handler.getMoviesByPage);
router.get("/:id", handler.getMovieByID);
router.get("/:id/metrics", handler.getMovieMetrics);
router.get("/:id/trivia", handler.getTrivia);

export default router;
