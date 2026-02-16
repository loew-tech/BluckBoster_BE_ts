import { Router } from "express";

import * as handler from "../handlers/members.js";

const router = Router();

router.post("/login", handler.getMemberByUsername);

export default router;
