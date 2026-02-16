import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  GetMovieParams,
  GetMoviesByPageQueryParams,
} from "../types/query-params.js";
import movieRepo, { DynamoMovieRepo } from "../repos/movies.js";
import { FOR_REST_CALL, NOT_FOR_CART } from "../constants/constants.js";
import { Movie, MovieMetrics } from "../models/models.js";

const UPPERCASE_ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type GetMoviesRequest = Request<{}, {}, {}, GetMoviesByPageQueryParams>;
export const getMoviesByPage = async (
  req: GetMoviesRequest,
  res: Response<Movie[] | { error: string }>,
) => {
  const page = req.query.page?.toUpperCase() ?? "A";
  if (page.length !== 1 || !UPPERCASE_ASCII.includes(page)) {
    throw Error(`invalid page query ${page}`);
  }

  const movies = await movieRepo.getMoviesByPage(page, FOR_REST_CALL);
  if (!movies) {
    return res.status(StatusCodes.NOT_FOUND).json([]);
  }
  return res.status(StatusCodes.OK).json(movies);
};

type GetMovieRequest = Request<GetMovieParams, {}, {}, {}>;
export const getMovieByID = async (
  req: GetMovieRequest,
  res: Response<Movie | { error: string }>,
) => {
  const { id } = req.params;
  const movie = await movieRepo.getMovieByID(id, NOT_FOR_CART);
  return res.status(StatusCodes.OK).json(movie);
};

export const getMovieMetrics = async (
  req: GetMovieRequest,
  res: Response<MovieMetrics | { error: string }>,
) => {
  const { id } = req.params;
  const metrics = await movieRepo.getMovieMetrics(id);
  return res.status(StatusCodes.OK).json(metrics);
};
