import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { GetMoviesByPageQueryParams } from "../types/query-params.js";
import movieRepo, { DynamoMovieRepo } from "../repos/movies.js";
import { FOR_REST_CALL } from "../constants/constants.js";

const UPPERCASE_ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type GetMoviesRequest = Request<{}, {}, {}, GetMoviesByPageQueryParams>;

export class MovieHandler {
  // @TODO: make class in argument abstract type
  constructor(private readonly repo: DynamoMovieRepo) {}

  getMoviesByPage = async (req: GetMoviesRequest, res: Response) => {
    const page = req.query.page?.toUpperCase() ?? "A";
    if (!UPPERCASE_ASCII.includes(page)) {
      throw Error(`invalid page query ${page}`);
    }

    const movies = await this.repo.getMoviesByPage(page, FOR_REST_CALL);
    res.status(StatusCodes.OK).json(movies);
  };
}

const handler = new MovieHandler(movieRepo);
export default handler;
