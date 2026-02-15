import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// 1. Create the base client
const client = new DynamoDBClient({
  // Custom logger implementation
  logger: {
    info: (msg) => console.log(`[AWS INFO]: ${msg}`),
    warn: (msg) => console.warn(`[AWS WARN]: ${msg}`),
    error: (msg) => console.error(`[AWS ERROR]: ${msg}`),
    debug: (msg) => {
      // Only log debug in non-production environments
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[AWS DEBUG]: ${msg}`);
      }
    },
  },
});

// 2. Wrap it in the DocumentClient (optional but recommended)
// The DocumentClient also benefits from being a singleton!
export const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
