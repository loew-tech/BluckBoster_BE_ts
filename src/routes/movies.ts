import { Router } from "express";

import handler, { MovieHandler } from "../handlers/movies.js";

const router = Router();

router.get("/", handler.getMoviesByPage);

export default router;
