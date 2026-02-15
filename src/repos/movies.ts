import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  BatchGetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { Movie, MovieMetrics } from "../models/models.js";
import {
  FOR_GRAPH,
  FOR_REST_CALL,
  FOR_CENTROID_CACHE,
  PAGINATE_KEY_INDEX,
  PAGINATE_KEY,
} from "../constants/constants.js";
import { ddbDocClient } from "../lib/dynamoClient.js";

const MOVIE_TABLE = "BluckBoster_movies";

export class DynamoMovieRepo {
  constructor(private readonly client: DynamoDBDocumentClient) {}

  async getMoviesByPage(page: string, purpose: string): Promise<Movie[]> {
    let projection = "";
    let attrNames: Record<string, string> = { "#i": "id", "#c": "cast" };

    switch (purpose) {
      case FOR_GRAPH:
        projection = "#i, title, #c, director";
        break;
      case FOR_REST_CALL:
        // Added #c for cast and #y for year
        projection = "#i, title, #c, director, inventory, rented, rating, #y";
        attrNames["#y"] = "year";
        break;
      case FOR_CENTROID_CACHE:
        projection = "#i, centroid";
        break;
      default:
        throw new Error(`unknown purpose ${purpose} in getMoviesByPage call`);
    }

    const result = await this.client.send(
      new QueryCommand({
        TableName: MOVIE_TABLE,
        IndexName: PAGINATE_KEY_INDEX,
        KeyConditionExpression: `${PAGINATE_KEY} = :p`,
        ExpressionAttributeValues: { ":p": page },
        ProjectionExpression: projection,
        ExpressionAttributeNames: attrNames,
      }),
    );
    return (result.Items as Movie[]) || [];
  }

  async getMovieByID(movieID: string, forCart: boolean): Promise<Movie> {
    if (!movieID) throw new Error("movieID cannot be empty");

    let projection = "#i, title, inventory";
    const attrNames: Record<string, string> = { "#i": "id" };

    if (!forCart) {
      // Note the snake_case here to match your DB keys
      projection +=
        ", cast, director, rented, rating, review, synopsis, trivia, #y";
      attrNames["#y"] = "year";
    }
    const result = await this.client.send(
      new GetCommand({
        TableName: MOVIE_TABLE,
        Key: { id: movieID },
        ProjectionExpression: projection,
        ExpressionAttributeNames: attrNames,
      }),
    );

    if (!result.Item) {
      throw new Error("movie not found");
    }
    return result.Item as Movie;
  }

  async getMoviesByID(movieIDs: string[]): Promise<Movie[]> {
    if (movieIDs.length === 0) return [];
    if (movieIDs.length > 10)
      throw new Error("batch size exceeds DynamoDB 10-item limit");

    const result = await this.client.send(
      new BatchGetCommand({
        RequestItems: {
          [MOVIE_TABLE]: {
            Keys: movieIDs.map((id) => ({ id })),
            ProjectionExpression: "#i, title, inventory",
            ExpressionAttributeNames: { "#i": "id" },
          },
        },
      }),
    );

    // BatchGet returns responses grouped by table name
    return (result.Responses?.[MOVIE_TABLE] as Movie[]) || [];
  }

  async getMovieMetrics(movieID: string): Promise<MovieMetrics> {
    if (!movieID) throw new Error("movieID cannot be empty");

    const result = await this.client.send(
      new GetCommand({
        TableName: MOVIE_TABLE,
        Key: { id: movieID },
        ProjectionExpression: "metrics",
      }),
    );

    if (!result.Item?.metrics) {
      throw new Error("metrics attribute not found");
    }

    return result.Item.metrics as MovieMetrics;
  }

  async rent(movie: Movie): Promise<boolean> {
    return this.updateInventory(movie, 1);
  }

  async return(movie: Movie): Promise<boolean> {
    return this.updateInventory(movie, -1);
  }

  private async updateInventory(movie: Movie, delta: number): Promise<boolean> {
    // We use the movie.id from your interface (which matches 'id' in DB)
    await this.client.send(
      new UpdateCommand({
        TableName: MOVIE_TABLE,
        Key: { id: movie.id },
        // Atomic update: increment/decrement directly in DDB
        UpdateExpression:
          "SET inventory = inventory - :d, rented = rented + :d",
        ExpressionAttributeValues: { ":d": delta },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    return true;
  }
}

const repo = new DynamoMovieRepo(ddbDocClient);
export default repo;
