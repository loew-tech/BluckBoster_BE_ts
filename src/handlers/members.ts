import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { GetMemberByUsernameBody } from "../types/query-params.js";
import * as membersRepo from "../repos/members.js";

type GetMemberRequest = Request<{}, {}, GetMemberByUsernameBody, {}>;
export const getMemberByUsername = async (
    req: GetMemberRequest,
//   req: Request,
  res: Response,
) => {
  console.log(req);
    const { username } = req.body;
//   const username = req.body.username ?? "chief_wiggum";
  const member = await membersRepo.getMemberByUsername(username, false);
  return res.status(StatusCodes.OK).json(member);
};
