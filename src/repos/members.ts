import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";

import { ddbDocClient } from "../lib/dynamoClient.js";
import { Member } from "../models/models.js";
import { USERNAME, TYPE } from "../constants/constants.js";

const MEBMERS_TABLE = "BluckBoster_members";

export const getMemberByUsername = async (
  username: string,
  cartOnly: boolean,
): Promise<Member> => {
  const input: GetCommandInput = {
    TableName: MEBMERS_TABLE,
    Key: {
      [USERNAME]: username,
    },
  };

  if (cartOnly) {
    // Use ProjectionExpression to limit returned fields
    // Note: '#t' is used because 'TYPE' is often a reserved word in DynamoDB
    input.ProjectionExpression = "username, cart, checked_out, #t";
    input.ExpressionAttributeNames = {
      "#t": TYPE,
    };
  }

  const result = await ddbDocClient.send(new GetCommand(input));

  if (!result.Item) {
    throw new Error(`user ${username} not found`);
  }

  // In the JS DocumentClient, unmarshalling is handled automatically
  return result.Item as Member;
};
